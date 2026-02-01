import type { App } from 'vue'

import { NucModulesSettings, NucModulesSettingsDetail } from '.'

export function registerNucModules(app: App<Element>): void {
  app
    .component('nuc-modules-settings', NucModulesSettings)
    .component('nuc-modules-settings-detail', NucModulesSettingsDetail)
}
