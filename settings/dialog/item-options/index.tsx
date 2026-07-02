'use client'

import { useMemo, useState } from 'react'

import type { ModuleItemOptionsDialogInterface } from 'nucleify'
import { AdButton, AdCheckbox, AdDialog, t } from 'nucleify'

import './_index.scss'

export function NucModulesItemOptionsDialog({
  visible,
  onHide,
  name,
  enabled,
  action,
  onConfirm,
}: ModuleItemOptionsDialogInterface) {
  const [deleteModuleFiles, setDeleteModuleFiles] = useState(false)

  const config = useMemo(() => {
    if (action === 'install') {
      return {
        header: 'Confirm Install',
        actionVerb: 'install',
        label: 'Install',
        icon: 'prime:download',
        severity: 'success' as const,
      }
    }

    if (action === 'uninstall') {
      return {
        header: 'Confirm Uninstall',
        actionVerb: 'uninstall',
        label: 'Uninstall',
        icon: 'prime:trash',
        severity: 'danger' as const,
      }
    }

    return {
      header: enabled ? 'Confirm Disable' : 'Confirm Enable',
      actionVerb: enabled ? 'disable' : 'enable',
      label: enabled ? 'Disable' : 'Enable',
      icon: enabled ? 'prime:times-circle' : 'prime:check-circle',
      severity: 'secondary' as const,
    }
  }, [action, enabled])

  function handleConfirm(): void {
    onHide()

    if (action === 'uninstall') {
      void onConfirm({ deleteModuleFiles })
      setDeleteModuleFiles(false)
      return
    }

    void onConfirm()
  }

  return (
    <AdDialog
      visible={visible}
      onHide={onHide}
      modal
      header={config.header}
      className="modules-settings-options-dialog"
      footer={
        <>
          <AdButton
            label="Cancel"
            icon="prime:times"
            severity="secondary"
            text
            rounded
            type="button"
            onClick={onHide}
          />
          <AdButton
            label={config.label}
            icon={config.icon}
            severity={config.severity}
            nuiType="main"
            text
            rounded
            type="button"
            onClick={handleConfirm}
          />
        </>
      }
    >
      <p>
        Are you sure you want to {config.actionVerb} <strong>{name}</strong>?
      </p>
      {action === 'uninstall' ? (
        <div className="modules-settings-options-dialog__delete-files">
          <AdCheckbox
            inputId="delete-module-files"
            checked={deleteModuleFiles}
            onChange={(event) => setDeleteModuleFiles(event.checked === true)}
          />
          <label
            htmlFor="delete-module-files"
            className="modules-settings-options-dialog__delete-files-label"
          >
            {t('modules-uninstall-delete-files-label')}
          </label>
          <p className="modules-settings-options-dialog__delete-files-hint">
            {t('modules-uninstall-delete-files-hint')}
          </p>
        </div>
      ) : null}
    </AdDialog>
  )
}
