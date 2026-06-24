import type { ModuleDialogAction } from 'nucleify'

export interface ModuleDialogInterface {
  name: string
  enabled: boolean
  action: ModuleDialogAction
}
