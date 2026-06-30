#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Scans every subdirectory of `modules` for `config.json` and rewrites the nuc_modules SQL seeder.
 * Invoked from merge-module-supabase-sql.sh before merging seeders.
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '../../..')
const modulesRoot = join(repoRoot, 'modules')
const outFile = join(
  repoRoot,
  'modules/nuc_modules/supabase/seeders/20260501000000_nuc_modules_seeder.sql'
)
const syncFnMigration = join(
  repoRoot,
  'modules/nuc_modules/supabase/migrations/20260629000000_nuc_modules_sync_registry.sql'
)

/** @typedef {{ name: string, description: string, category: string, version: string, enabled: boolean, installed: boolean }} RegistryEntry */

/** @type {RegistryEntry[]} */
const registry = []

for (const entry of readdirSync(modulesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue

  const folderName = entry.name
  const cfgPath = join(modulesRoot, folderName, 'config.json')

  let cfg
  try {
    cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
  } catch {
    continue
  }

  if (!cfg || typeof cfg !== 'object') continue

  if (typeof cfg.name === 'string' && cfg.name !== folderName) {
    process.stderr.write(
      `generate-seeder: warning ${folderName}: config "name" is "${cfg.name}"; using directory name as canonical key\n`
    )
  }

  registry.push({
    name: folderName,
    description: typeof cfg.description === 'string' ? cfg.description : '',
    category: typeof cfg.category === 'string' ? cfg.category : 'other',
    version: typeof cfg.version === 'string' ? cfg.version : '0.0.0',
    enabled: cfg.enabled !== false,
    installed: cfg.installed !== false,
  })
}

registry.sort((a, b) => a.name.localeCompare(b.name))

const header = `-- ! AUTO-GENERATED — source: modules/*/config.json (dir name = modules.name). Regenerate: pnpm supabase:merge-sql

-- Ensures sync_modules_from_registry exists before seeding (idempotent).
`

const preamble = `${readFileSync(syncFnMigration, 'utf8').trim()}\n\n`

let body
if (registry.length === 0) {
  body = `-- no modules with config.json found
select public.sync_modules_from_registry('[]'::jsonb);
`
} else {
  const registryJson = JSON.stringify(registry, null, 2)
  body = `select public.sync_modules_from_registry(
$registry$${registryJson}$registry$::jsonb
);
`
}

writeFileSync(outFile, header + preamble + body, 'utf8')
process.stderr.write(
  `generate-seeder: ${registry.length} module(s) -> ${outFile}\n`
)
