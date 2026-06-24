'use client'

import type { ModuleReadmeDialogComponentProps } from 'nucleify'
import { AdButton, AdDialog, NucModulesReadme } from 'nucleify'

import './_index.scss'

export function NucModulesSettingsDetailReadmeDialog({
  modulePath,
  visible,
  onHide,
}: ModuleReadmeDialogComponentProps) {
  return (
    <AdDialog
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      showHeader={false}
      className="modules-settings-readme-dialog"
      footer={
        <AdButton
          label="Close"
          icon="prime:times"
          severity="secondary"
          text
          rounded
          type="button"
          onClick={onHide}
        />
      }
    >
      <NucModulesReadme modulePath={modulePath} showLoading />
    </AdDialog>
  )
}
