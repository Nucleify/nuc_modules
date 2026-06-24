import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SAFE_MODULE_NAME_REGEX = /^nuc_[a-z0-9_]+$/

export function assertSafeModuleName(moduleName: string): void {
  if (!SAFE_MODULE_NAME_REGEX.test(moduleName)) {
    throw new Error(`Invalid module name: ${moduleName}`)
  }
}

export async function resolveRepoModulesParentDir(): Promise<string> {
  const cwd = process.cwd()
  const fromThisFile = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..',
    'modules'
  )
  const candidates = [
    join(cwd, 'modules'),
    join(cwd, '..', 'modules'),
    fromThisFile,
  ]
  for (const p of candidates) {
    try {
      const s = await stat(p)
      if (s.isDirectory()) return resolve(p)
    } catch {
      /* next */
    }
  }
  throw new Error(
    'Could not resolve repo modules/ directory (tried cwd and relative paths).'
  )
}

export function isResolvedPathInsideDir(
  dir: string,
  candidate: string
): boolean {
  const d = resolve(dir)
  const c = resolve(candidate)
  return c === d || c.startsWith(d + sep)
}

export async function deleteModuleDirectory(moduleName: string): Promise<void> {
  assertSafeModuleName(moduleName)
  const modulesParent = await resolveRepoModulesParentDir()
  const dir = resolve(join(modulesParent, moduleName))
  if (!isResolvedPathInsideDir(modulesParent, dir)) {
    throw new Error(
      `Refusing to delete: path escapes modules directory (${moduleName}).`
    )
  }
  await rm(dir, { recursive: true, force: true })
}

export function moduleBootstrapTsPath(
  modulesParent: string,
  moduleName: string
): string {
  return resolve(join(modulesParent, moduleName, `${moduleName}.ts`))
}

export function moduleConfigJsonPath(
  modulesParent: string,
  moduleName: string
): string {
  return resolve(join(modulesParent, moduleName, 'config.json'))
}

export async function resolveModuleDirOnDisk(
  moduleName: string
): Promise<string> {
  assertSafeModuleName(moduleName)
  const parent = await resolveRepoModulesParentDir()
  const moduleDir = resolve(join(parent, moduleName))
  const configPath = moduleConfigJsonPath(parent, moduleName)

  try {
    await access(configPath)
    if (!isResolvedPathInsideDir(parent, moduleDir)) {
      throw new Error(
        `Refusing to use module path outside modules directory (${moduleName}).`
      )
    }
    return moduleDir
  } catch {
    try {
      await access(moduleDir)
      if (!isResolvedPathInsideDir(parent, moduleDir)) {
        throw new Error(
          `Refusing to use module path outside modules directory (${moduleName}).`
        )
      }
      return moduleDir
    } catch {
      throw new Error(
        `Module not found on disk: modules/${moduleName}/ (expected config.json or module directory).`
      )
    }
  }
}

/** @deprecated ZIP uploads may still require a bootstrap .ts; JSON install uses config.json. */
export async function assertModuleBootstrapTsExists(
  moduleName: string
): Promise<void> {
  assertSafeModuleName(moduleName)
  const parent = await resolveRepoModulesParentDir()
  const entry = moduleBootstrapTsPath(parent, moduleName)
  try {
    await access(entry)
  } catch {
    throw new Error(
      `Missing bootstrap file: modules/${moduleName}/${moduleName}.ts`
    )
  }
}

const DEFAULT_CONFIG = (name: string) =>
  ({
    name,
    description: `Module ${name}.`,
    version: '0.0.1',
    category: 'other',
    installed: true,
    enabled: true,
  }) as const

export async function ensureDefaultModuleConfigJson(
  moduleDir: string,
  moduleName: string
): Promise<void> {
  assertSafeModuleName(moduleName)
  const configPath = join(moduleDir, 'config.json')
  try {
    await access(configPath)
    return
  } catch {
    await mkdir(moduleDir, { recursive: true })
    await writeFile(
      configPath,
      `${JSON.stringify({ ...DEFAULT_CONFIG(moduleName) }, null, 2)}\n`,
      'utf8'
    )
  }
}

export async function readModuleConfigMeta(
  moduleDir: string,
  moduleName: string
): Promise<{
  description: string
  category: string
  version: string
}> {
  const configPath = join(moduleDir, 'config.json')
  try {
    const raw = await readFile(configPath, 'utf8')
    const p = JSON.parse(raw) as Record<string, unknown>
    return {
      description:
        typeof p.description === 'string'
          ? p.description
          : `Module ${moduleName}.`,
      category: typeof p.category === 'string' ? p.category : 'other',
      version: typeof p.version === 'string' ? p.version : '0.0.1',
    }
  } catch {
    return {
      description: `Module ${moduleName}.`,
      category: 'other',
      version: '0.0.1',
    }
  }
}
