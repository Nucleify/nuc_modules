'use client'

import { useCallback, useEffect, useState } from 'react'

import type { ModuleObjectInterface } from 'nucleify'
import {
  AdCard,
  apiRequest,
  NucModulesList,
  NucModulesSettingsInstallModule,
} from 'nucleify'

import './_index.scss'

function normalizeModule(module: ModuleObjectInterface): ModuleObjectInterface {
  return {
    ...module,
    enabled: module.enabled === true,
    installed: module.installed === true,
  }
}

function extractModules(
  response: unknown
): ModuleObjectInterface[] | undefined {
  if (typeof response !== 'object' || response === null) return undefined

  if (
    'modules' in response &&
    Array.isArray((response as { modules: unknown }).modules)
  ) {
    return (response as { modules: ModuleObjectInterface[] }).modules.map(
      normalizeModule
    )
  }

  if (
    'data' in response &&
    typeof (response as { data: unknown }).data === 'object' &&
    (response as { data: unknown }).data !== null
  ) {
    const data = (response as { data: { modules?: ModuleObjectInterface[] } })
      .data
    if (Array.isArray(data.modules)) return data.modules.map(normalizeModule)
  }

  return undefined
}

export function NucModulesSettings() {
  const [modules, setModules] = useState<ModuleObjectInterface[]>([])

  const loadModules = useCallback(async () => {
    try {
      const response = await apiRequest<{ modules: ModuleObjectInterface[] }>(
        '/api/modules/all'
      )
      const list = extractModules(response)
      if (list) setModules(list)
    } catch (error) {
      console.error('Failed to load modules', error)
      setModules([])
    }
  }, [])

  useEffect(() => {
    void loadModules()
  }, [loadModules])

  const refreshModules = useCallback(async () => {
    await loadModules()
  }, [loadModules])

  return (
    <AdCard
      className="modules-settings-card"
      header={
        <NucModulesSettingsInstallModule onModuleInstalled={refreshModules} />
      }
    >
      <NucModulesList
        data={modules}
        onModuleToggled={refreshModules}
        onModuleUninstalled={refreshModules}
      />
    </AdCard>
  )
}
