import { stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

let cachedDiskSync: boolean | undefined

/**
 * True when the server can read/write the monorepo `modules/` tree (`config.json`, zip extract, delete dir).
 * Cloudflare Workers and most edge hosts bundle code without the repo — `stat` fails → false.
 *
 * Override: `NUXT_MODULE_DISK_SYNC` or `MODULE_DISK_SYNC` = `true` / `false` / `1` / `0`.
 */
export async function isModuleDiskSyncEnabled(): Promise<boolean> {
  if (cachedDiskSync !== undefined) return cachedDiskSync

  const env =
    process.env.NUXT_MODULE_DISK_SYNC ?? process.env.MODULE_DISK_SYNC ?? ''
  if (env === 'false' || env === '0') {
    cachedDiskSync = false
    return false
  }
  if (env === 'true' || env === '1') {
    cachedDiskSync = true
    return true
  }

  const fromThisFile = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..',
    'modules'
  )
  const candidates = [
    join(process.cwd(), 'modules'),
    join(process.cwd(), '..', 'modules'),
    fromThisFile,
  ]
  for (const p of candidates) {
    try {
      const s = await stat(p)
      if (s.isDirectory()) {
        cachedDiskSync = true
        return true
      }
    } catch {
      /* next */
    }
  }
  cachedDiskSync = false
  return false
}
