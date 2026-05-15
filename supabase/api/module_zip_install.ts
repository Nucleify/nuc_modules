import type { H3Event } from 'h3'
import { readMultipartFormData } from 'h3'

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { unzipSync } from 'fflate'
import type { ApiHandlerResult } from '../../../../nuxt/server/api/_types'
import { syncModuleConfigInstall } from './module_config_sync'
import {
  assertSafeModuleName,
  ensureDefaultModuleConfigJson,
  isResolvedPathInsideDir,
  readModuleConfigMeta,
  resolveRepoModulesParentDir,
} from './module_install_disk'

function stemFromZipFilename(filename: string): string | null {
  const lower = filename.toLowerCase()
  if (!lower.endsWith('.zip')) return null
  const base = filename.slice(0, -4)
  return base || null
}

function normalizeZipPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '')
}

function isSafeRelativePath(rel: string): boolean {
  const n = normalizeZipPath(rel)
  if (!n || n.endsWith('/')) return false
  return !n.includes('..')
}

function pathSetFromUnzip(files: Record<string, Uint8Array>): Set<string> {
  const set = new Set<string>()
  for (const k of Object.keys(files)) {
    const n = normalizeZipPath(k)
    if (n && !n.endsWith('/')) set.add(n)
  }
  return set
}

function hasBootstrapTs(stem: string, paths: Set<string>): boolean {
  return paths.has(`${stem}.ts`) || paths.has(`${stem}/${stem}.ts`)
}

export async function upsertModuleRow(
  supabase: SupabaseClient,
  name: string,
  meta: { description: string; category: string; version: string }
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString()
  const { data: existing, error: selErr } = await supabase
    .from('modules')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (selErr) throw new Error(selErr.message)

  if (existing?.id != null) {
    const { data, error } = await supabase
      .from('modules')
      .update({
        enabled: true,
        installed: true,
        description: meta.description,
        category: meta.category,
        version: meta.version,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as Record<string, unknown>
  }

  const { data, error } = await supabase
    .from('modules')
    .insert({
      name,
      description: meta.description,
      category: meta.category,
      version: meta.version,
      enabled: true,
      installed: true,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Record<string, unknown>
}

/**
 * POST multipart (PrimeVue FileUpload): ZIP musi mieć ten sam stem co plik wejścia modułu,
 * np. `nuc_test.zip` → w archiwum `nuc_test.ts` (root) albo `nuc_test/nuc_test.ts`.
 * Zapis do `modules/<stem>/`, brak `config.json` → prosty domyślny, potem wiersz w `public.modules`.
 */
export async function handleModuleZipInstall(
  event: H3Event,
  supabase: SupabaseClient
): Promise<ApiHandlerResult> {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(
    (p) => p.name === 'file' && p.filename && p.data?.length
  )
  if (!filePart?.filename || !filePart.data?.length) {
    return {
      handled: true,
      status: 400,
      body: {
        error: 'Expected multipart field "file" with a non-empty .zip upload.',
      },
    }
  }

  const stem = stemFromZipFilename(filePart.filename)
  if (!stem) {
    return {
      handled: true,
      status: 400,
      body: { error: 'Zip filename must end with .zip (e.g. nuc_test.zip).' },
    }
  }

  try {
    assertSafeModuleName(stem)
  } catch (e) {
    return {
      handled: true,
      status: 400,
      body: {
        error:
          e instanceof Error
            ? e.message
            : 'Invalid module name (expected nuc_* slug matching folder).',
      },
    }
  }

  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(new Uint8Array(filePart.data))
  } catch {
    return {
      handled: true,
      status: 400,
      body: { error: 'Invalid or corrupt zip archive.' },
    }
  }

  const pathSet = pathSetFromUnzip(files)
  if (!hasBootstrapTs(stem, pathSet)) {
    return {
      handled: true,
      status: 400,
      body: {
        error: `Zip "${filePart.filename}" must contain ${stem}.ts at archive root or ${stem}/${stem}.ts (same basename as the zip, Laravel-style).`,
      },
    }
  }

  const useNestedRoot = pathSet.has(`${stem}/${stem}.ts`)
  const modulesParent = await resolveRepoModulesParentDir()
  const targetDir = resolve(join(modulesParent, stem))

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })

  for (const [rawPath, data] of Object.entries(files)) {
    const norm = normalizeZipPath(rawPath)
    if (!norm || norm.endsWith('/')) continue

    let rel: string
    if (useNestedRoot) {
      if (norm.startsWith(`${stem}/`)) rel = norm.slice(stem.length + 1)
      else if (norm === `${stem}.ts`) rel = `${stem}.ts`
      else continue
    } else {
      rel = norm
    }

    if (!isSafeRelativePath(rel)) {
      return {
        handled: true,
        status: 400,
        body: { error: `Unsafe or invalid path in zip: ${rawPath}` },
      }
    }
    const outPath = resolve(join(targetDir, rel))
    if (!isResolvedPathInsideDir(targetDir, outPath)) {
      return {
        handled: true,
        status: 400,
        body: { error: `Zip path escapes module directory: ${rawPath}` },
      }
    }
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, data)
  }

  await ensureDefaultModuleConfigJson(targetDir, stem)
  const meta = await readModuleConfigMeta(targetDir, stem)

  try {
    const row = await upsertModuleRow(supabase, stem, meta)
    await syncModuleConfigInstall(stem)
    return {
      handled: true,
      body: {
        data: row,
        path: `modules/${stem}/`,
        message: `Module "${stem}" installed from zip.`,
      },
    }
  } catch (e) {
    return {
      handled: true,
      status: 500,
      body: {
        error:
          e instanceof Error
            ? e.message
            : 'Failed to persist module to database.',
      },
    }
  }
}
