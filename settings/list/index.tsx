'use client'

import type { NucModulesListInterface } from 'nucleify'
import { NucModulesSettingsItem } from 'nucleify'

import './_index.scss'

export function NucModulesList({
  data,
  onModuleToggled,
  onModuleUninstalled,
}: NucModulesListInterface) {
  return (
    <div className="modules-settings-list">
      {data.map((module) => (
        <NucModulesSettingsItem
          key={module.name}
          {...module}
          onModuleToggled={onModuleToggled}
          onModuleUninstalled={onModuleUninstalled}
        />
      ))}
    </div>
  )
}
