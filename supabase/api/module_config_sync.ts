import { access, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertSafeModuleName } from './module_install_disk'

function candidateConfigPaths(moduleName: string): string[] {
  const cwd = process.cwd()
  const fromThisFile = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..',
    'modules',
    moduleName,
    'config.json'
  )
  return [
    join(cwd, 'modules', moduleName, 'config.json'),
    join(cwd, '..', 'modules', moduleName, 'config.json'),
    fromThisFile,
  ]
}

async function resolveExistingConfigPath(
  moduleName: string
): Promise<string | null> {
  for (const p of candidateConfigPaths(moduleName)) {
    try {
      await access(p)
      return p
    } catch {
      /* try next */
    }
  }
  return null
}

/**
 * Persists `enabled` into `modules/<name>/config.json` (same source as merge-seeder).
 * Fails if the file is missing or not writable — keeps DB and repo in sync when it succeeds.
 */
export async function syncModuleConfigEnabled(
  moduleName: string,
  enabled: boolean
): Promise<void> {
  assertSafeModuleName(moduleName)

  const path = await resolveExistingConfigPath(moduleName)
  if (!path) {
    throw new Error(
      `config.json not found for module "${moduleName}" (looked under modules/).`
    )
  }

  const raw = await readFile(path, 'utf8')
  const parsed: Record<string, unknown> = JSON.parse(raw) as Record<
    string,
    unknown
  >
  parsed.enabled = enabled
  await writeFile(path, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
}

/**
 * Uninstall: mark module off in repo config (same fields as `config.json` → seeder merge).
 */
export async function syncModuleConfigUninstall(
  moduleName: string
): Promise<void> {
  assertSafeModuleName(moduleName)

  const path = await resolveExistingConfigPath(moduleName)
  if (!path) {
    throw new Error(
      `config.json not found for module "${moduleName}" (looked under modules/).`
    )
  }

  const raw = await readFile(path, 'utf8')
  const parsed: Record<string, unknown> = JSON.parse(raw) as Record<
    string,
    unknown
  >
  parsed.enabled = false
  parsed.installed = false
  await writeFile(path, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
}

/** Re-register bundled module in repo config after uninstall. */
export async function syncModuleConfigInstall(
  moduleName: string
): Promise<void> {
  assertSafeModuleName(moduleName)

  const path = await resolveExistingConfigPath(moduleName)
  if (!path) {
    throw new Error(
      `config.json not found for module "${moduleName}" (looked under modules/).`
    )
  }

  const raw = await readFile(path, 'utf8')
  const parsed: Record<string, unknown> = JSON.parse(raw) as Record<
    string,
    unknown
  >
  parsed.enabled = true
  parsed.installed = true
  await writeFile(path, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
}
