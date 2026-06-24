import type { ModuleDialogAction } from 'nucleify'

export interface ModuleReadmeDialogInterface {
  modulePath?: string
}

export interface ModuleReadmeDialogComponentProps
  extends ModuleReadmeDialogInterface {
  visible: boolean
  onHide: () => void
}

export interface ModuleItemOptionsDialogInterface {
  visible: boolean
  onHide: () => void
  name: string
  enabled: boolean
  action: ModuleDialogAction
  onConfirm: (payload?: { deleteModuleFiles?: boolean }) => void | Promise<void>
}
