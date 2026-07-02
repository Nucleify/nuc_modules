'use client'

import type { NucModulesUninstallModuleInterface } from 'nucleify'
import { AdButton, moduleRequests } from 'nucleify'

import './_index.scss'

export default function NucModulesSettingsUninstallModule({
  name,
  onModuleUninstalled,
}: NucModulesUninstallModuleInterface) {
  const { uninstallModule } = moduleRequests()

  return (
    <AdButton
      nuiType="main"
      text
      rounded
      icon="prime:trash"
      className="uninstall-module-button"
      type="button"
      onClick={() => void uninstallModule(name, () => onModuleUninstalled?.())}
    />
  )
}
