import { getRequestHeader, readBody } from 'h3'

import { join } from 'node:path'
import type {
  ApiContext,
  ApiHandlerResult,
  Json,
} from '../../../../nuxt/server/api/_types'
import {
  syncModuleConfigEnabled,
  syncModuleConfigInstall,
  syncModuleConfigUninstall,
} from './module_config_sync'
import {
  assertModuleBootstrapTsExists,
  deleteModuleDirectory,
  ensureDefaultModuleConfigJson,
  readModuleConfigMeta,
  resolveRepoModulesParentDir,
} from './module_install_disk'
import { isModuleDiskSyncEnabled } from './module_install_env'
import { handleModuleZipInstall, upsertModuleRow } from './module_zip_install'

/** Second path segment values that are not module slugs. */
const MODULES_RESERVED = new Set(['all', 'toggle', 'install', 'uninstall'])

export async function handleModulesApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  const { segments, method, supabase, ok } = ctx
  if (segments[0] !== 'modules') return { handled: false }

  if (segments[1] === 'all' && method === 'GET') {
    const { data, error } = await supabase.from('modules').select('*')
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    // Match Laravel ModuleController::getAllModules — { modules: [...] } (not ok(array) → { data: [] })
    return { handled: true, body: { modules: data || [] } }
  }

  if (
    method === 'GET' &&
    segments.length >= 2 &&
    Boolean(segments[1]) &&
    !MODULES_RESERVED.has(segments[1]!)
  ) {
    const name = segments[1]!
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('name', name)
      .maybeSingle()
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    if (!data)
      return { handled: true, status: 404, body: { error: 'Module not found' } }
    return { handled: true, body: ok(data) }
  }

  if (segments[1] === 'toggle' && method === 'PATCH') {
    const body = (await readBody(ctx.event)) as Json
    const byName = typeof body.name === 'string' ? body.name : null
    const byId = body.id as string | number | undefined

    let q = supabase.from('modules').select('id, enabled')
    if (byName) q = q.eq('name', byName)
    else if (byId !== undefined && byId !== null) q = q.eq('id', byId)
    else
      return {
        handled: true,
        status: 400,
        body: { error: 'name or id required' },
      }

    const { data: row, error: readErr } = await q.maybeSingle()
    if (readErr)
      return { handled: true, status: 500, body: { error: readErr.message } }
    if (!row)
      return { handled: true, status: 404, body: { error: 'Module not found' } }

    const nextEnabled =
      typeof body.enabled === 'boolean' ? body.enabled : !row.enabled

    const { data: updated, error } = await supabase
      .from('modules')
      .update({ enabled: nextEnabled, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .select('*')
      .single()
    if (error)
      return { handled: true, status: 400, body: { error: error.message } }
    if (await isModuleDiskSyncEnabled()) {
      try {
        await syncModuleConfigEnabled(
          String(updated.name),
          Boolean(updated.enabled)
        )
      } catch (e) {
        return {
          handled: true,
          status: 500,
          body: {
            error:
              e instanceof Error
                ? e.message
                : 'Failed to update module config.json',
          },
        }
      }
    }
    return { handled: true, body: ok(updated) }
  }

  if (segments[1] === 'install' && method === 'POST') {
    const contentType =
      getRequestHeader(ctx.event, 'content-type')?.toLowerCase() ?? ''
    if (contentType.includes('multipart/form-data')) {
      if (!(await isModuleDiskSyncEnabled())) {
        return {
          handled: true,
          status: 501,
          body: {
            error:
              'ZIP install needs a writable monorepo modules/ directory. On this host use JSON install (name + optional description/category/version) to register a module that already exists in the app bundle.',
          },
        }
      }
      return handleModuleZipInstall(ctx.event, supabase)
    }

    const body = (await readBody(ctx.event)) as Json
    const name = typeof body.name === 'string' ? body.name : null
    if (!name)
      return {
        handled: true,
        status: 400,
        body: { error: 'name required' },
      }

    const disk = await isModuleDiskSyncEnabled()
    let meta: { description: string; category: string; version: string }

    if (disk) {
      try {
        await assertModuleBootstrapTsExists(name)
      } catch (e) {
        return {
          handled: true,
          status: 400,
          body: {
            error:
              e instanceof Error
                ? e.message
                : 'Module bootstrap file missing (modules/<name>/<name>.ts).',
          },
        }
      }

      let moduleDir: string
      try {
        const parent = await resolveRepoModulesParentDir()
        moduleDir = join(parent, name)
        await ensureDefaultModuleConfigJson(moduleDir, name)
      } catch (e) {
        return {
          handled: true,
          status: 500,
          body: {
            error:
              e instanceof Error
                ? e.message
                : 'Failed to ensure module config.json on disk.',
          },
        }
      }
      meta = await readModuleConfigMeta(moduleDir, name)
    } else {
      meta = {
        description:
          typeof body.description === 'string' && body.description.trim()
            ? body.description.trim()
            : `Module ${name}.`,
        category:
          typeof body.category === 'string' && body.category.trim()
            ? body.category.trim()
            : 'other',
        version:
          typeof body.version === 'string' && body.version.trim()
            ? body.version.trim()
            : '0.0.1',
      }
    }

    try {
      const row = await upsertModuleRow(supabase, name, meta)
      if (disk) await syncModuleConfigInstall(name)
      return { handled: true, body: ok(row) }
    } catch (e) {
      return {
        handled: true,
        status: 500,
        body: {
          error:
            e instanceof Error
              ? e.message
              : 'Failed to install module (database or config sync).',
        },
      }
    }
  }

  if (segments[1] === 'uninstall' && method === 'POST') {
    const body = (await readBody(ctx.event)) as Json
    const name = typeof body.name === 'string' ? body.name : null
    const deleteModuleFiles =
      body.deleteModuleFiles === true || body.delete_module_files === true
    if (!name)
      return {
        handled: true,
        status: 400,
        body: { error: 'name required' },
      }

    if (deleteModuleFiles && !(await isModuleDiskSyncEnabled())) {
      return {
        handled: true,
        status: 400,
        body: {
          error:
            'Deleting module files from disk is not supported on this server. Disable “delete files” to only update the database, or run uninstall from a machine with the monorepo.',
        },
      }
    }

    const { data: row, error: readErr } = await supabase
      .from('modules')
      .select('id')
      .eq('name', name)
      .maybeSingle()
    if (readErr)
      return { handled: true, status: 500, body: { error: readErr.message } }
    if (!row)
      return { handled: true, status: 404, body: { error: 'Module not found' } }

    const { data: updated, error } = await supabase
      .from('modules')
      .update({
        enabled: false,
        installed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .select('*')
      .single()
    if (error)
      return { handled: true, status: 400, body: { error: error.message } }

    if (deleteModuleFiles) {
      try {
        try {
          await syncModuleConfigUninstall(name)
        } catch {
          /* brak config.json — przechodzimy do usunięcia katalogu */
        }
        await deleteModuleDirectory(name)
      } catch (e) {
        return {
          handled: true,
          status: 500,
          body: {
            error:
              e instanceof Error
                ? e.message
                : 'Failed to delete module files from disk.',
          },
        }
      }
    } else if (await isModuleDiskSyncEnabled()) {
      try {
        await syncModuleConfigUninstall(name)
      } catch (e) {
        return {
          handled: true,
          status: 500,
          body: {
            error:
              e instanceof Error
                ? e.message
                : 'Failed to update module config.json',
          },
        }
      }
    }
    return { handled: true, body: ok(updated) }
  }

  return { handled: true, body: { success: true } }
}
