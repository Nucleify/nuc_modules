import type { ModuleDialogAction } from './types'

export interface ModuleDialogInterface {
  name: string
  enabled: boolean
  action: ModuleDialogAction
}
