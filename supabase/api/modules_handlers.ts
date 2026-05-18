import { join } from 'node:path'
import { getRequestHeader } from 'h3'

import type { ApiContext, ApiHandlerResult, Json } from 'nuc_api'
import {
  apiBody,
  apiError,
  apiOk,
  fromSupabaseError,
  fromThrown,
  nowIso,
  readJsonBody,
  seg,
  trimStr,
} from 'nuc_api'

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

const RESERVED = new Set(['all', 'toggle', 'install', 'uninstall'])

type ModuleMeta = { description: string; category: string; version: string }

export async function handleListModules(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const { data, error } = await ctx.supabase.from('modules').select('*')
  return error ? fromSupabaseError(error) : apiBody({ modules: data || [] })
}

export async function handleGetModule(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const name = seg(ctx, 1)
  if (!name || ctx.segments.length < 2 || RESERVED.has(name)) return null

  const { data, error } = await ctx.supabase
    .from('modules')
    .select('*')
    .eq('name', name)
    .maybeSingle()
  if (error) return fromSupabaseError(error)
  return data ? apiOk(ctx, data) : apiError(404, 'Module not found')
}

export async function handleToggleModule(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const body = await readJsonBody(ctx)
  const byName = typeof body.name === 'string' ? body.name : null
  const byId = body.id as string | number | undefined

  let q = ctx.supabase.from('modules').select('id, enabled')
  if (byName) q = q.eq('name', byName)
  else if (byId != null) q = q.eq('id', byId)
  else return apiError(400, 'name or id required')

  const { data: row, error: readErr } = await q.maybeSingle()
  if (readErr) return fromSupabaseError(readErr)
  if (!row) return apiError(404, 'Module not found')

  const nextEnabled =
    typeof body.enabled === 'boolean' ? body.enabled : !row.enabled
  const { data: updated, error } = await ctx.supabase
    .from('modules')
    .update({ enabled: nextEnabled, updated_at: nowIso() })
    .eq('id', row.id)
    .select('*')
    .single()
  if (error) return fromSupabaseError(error, 400)

  if (await isModuleDiskSyncEnabled()) {
    try {
      await syncModuleConfigEnabled(
        String(updated.name),
        Boolean(updated.enabled)
      )
    } catch (e) {
      return fromThrown(e, 500, 'Failed to update module config.json')
    }
  }
  return apiOk(ctx, updated)
}

export async function handleInstallModule(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const contentType =
    getRequestHeader(ctx.event, 'content-type')?.toLowerCase() ?? ''
  if (contentType.includes('multipart/form-data')) {
    return installModuleZip(ctx)
  }
  return installModuleJson(ctx, await readJsonBody(ctx))
}

export async function handleUninstallModule(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const body = await readJsonBody(ctx)
  const name = typeof body.name === 'string' ? body.name : null
  const deleteFiles =
    body.deleteModuleFiles === true || body.delete_module_files === true
  if (!name) return apiError(400, 'name required')

  if (deleteFiles && !(await isModuleDiskSyncEnabled())) {
    return apiError(
      400,
      'Deleting module files from disk is not supported on this server. Disable “delete files” to only update the database, or run uninstall from a machine with the monorepo.'
    )
  }

  const { data: row, error: readErr } = await ctx.supabase
    .from('modules')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (readErr) return fromSupabaseError(readErr)
  if (!row) return apiError(404, 'Module not found')

  const { data: updated, error } = await ctx.supabase
    .from('modules')
    .update({ enabled: false, installed: false, updated_at: nowIso() })
    .eq('id', row.id)
    .select('*')
    .single()
  if (error) return fromSupabaseError(error, 400)

  const diskErr = await syncUninstallOnDisk(name, deleteFiles)
  if (diskErr) return diskErr

  return apiOk(ctx, updated)
}

async function installModuleZip(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  if (!(await isModuleDiskSyncEnabled())) {
    return apiError(
      501,
      'ZIP install needs a writable monorepo modules/ directory. On this host use JSON install (name + optional description/category/version) to register a module that already exists in the app bundle.'
    )
  }
  return handleModuleZipInstall(ctx.event, ctx.supabase)
}

async function installModuleJson(
  ctx: ApiContext,
  body: Json
): Promise<ApiHandlerResult | null> {
  const name = typeof body.name === 'string' ? body.name : null
  if (!name) return apiError(400, 'name required')

  const disk = await isModuleDiskSyncEnabled()
  const meta = disk
    ? await readInstallMetaFromDisk(name)
    : metaFromBody(body, name)
  if ('handled' in meta) return meta

  try {
    const row = await upsertModuleRow(ctx.supabase, name, meta)
    if (disk) await syncModuleConfigInstall(name)
    return apiOk(ctx, row)
  } catch (e) {
    return fromThrown(
      e,
      500,
      'Failed to install module (database or config sync).'
    )
  }
}

async function readInstallMetaFromDisk(
  name: string
): Promise<ModuleMeta | ApiHandlerResult> {
  try {
    await assertModuleBootstrapTsExists(name)
    const parent = await resolveRepoModulesParentDir()
    const moduleDir = join(parent, name)
    await ensureDefaultModuleConfigJson(moduleDir, name)
    return await readModuleConfigMeta(moduleDir, name)
  } catch (e) {
    const bootstrap = e instanceof Error && e.message.includes('bootstrap')
    return fromThrown(
      e,
      400,
      bootstrap
        ? 'Module bootstrap file missing (modules/<name>/<name>.ts).'
        : 'Failed to ensure module config.json on disk.'
    )
  }
}

function metaFromBody(body: Json, name: string): ModuleMeta {
  return {
    description: trimStr(body.description, `Module ${name}.`),
    category: trimStr(body.category, 'other'),
    version: trimStr(body.version, '0.0.1'),
  }
}

async function syncUninstallOnDisk(
  name: string,
  deleteFiles: boolean
): Promise<ApiHandlerResult | null> {
  if (deleteFiles) {
    try {
      try {
        await syncModuleConfigUninstall(name)
      } catch {
        /* brak config.json */
      }
      await deleteModuleDirectory(name)
    } catch (e) {
      return fromThrown(e, 500, 'Failed to delete module files from disk.')
    }
    return null
  }

  if (!(await isModuleDiskSyncEnabled())) return null
  try {
    await syncModuleConfigUninstall(name)
  } catch (e) {
    return fromThrown(e, 500, 'Failed to update module config.json')
  }
  return null
}
