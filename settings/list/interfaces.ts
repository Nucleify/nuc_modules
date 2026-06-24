import type { ModuleObjectInterface } from 'nucleify'

export interface NucModulesListInterface {
  data: ModuleObjectInterface[]
  onModuleToggled?: () => void | Promise<void>
  onModuleUninstalled?: () => void | Promise<void>
}

export interface NucModulesItemOptionsInterface extends ModuleObjectInterface {
  onModuleToggled?: () => void | Promise<void>
  onModuleUninstalled?: () => void | Promise<void>
}
