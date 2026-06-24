'use client'

import { useParams } from 'next/navigation'

import type { NucModulesItemOptionsInterface } from 'nucleify'
import { NucCube, NucModulesItemOptions } from 'nucleify'

import './_index.scss'

export function NucModulesSettingsItem({
  onModuleToggled,
  onModuleUninstalled,
  ...module
}: NucModulesItemOptionsInterface) {
  const params = useParams<{ lang?: string }>()
  const lang = params?.lang ?? 'en'

  return (
    <div className={`modules-settings-item${module.enabled ? ' active' : ''}`}>
      <a
        className="modules-settings-item-link"
        href={`/${lang}/settings#module-${module.name}`}
      >
        <span
          title={module.enabled ? 'Enabled' : 'Disabled'}
          style={{ display: 'inline-flex' }}
        >
          <NucCube shiny={module.enabled} />
        </span>
        <div className="modules-settings-item-container">
          <div className="modules-settings-item-info">
            <label>{module.name}</label>
            <p>{module.description}</p>
          </div>
        </div>
      </a>
      <NucModulesItemOptions
        {...module}
        onModuleToggled={onModuleToggled}
        onModuleUninstalled={onModuleUninstalled}
      />
    </div>
  )
}
