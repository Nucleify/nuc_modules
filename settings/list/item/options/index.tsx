'use client'

import { useRouter } from 'next/navigation'
import type { MenuItem, MenuItemCommandEvent } from 'primereact/menuitem'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ModuleDialogAction } from 'nucleify'
import {
  AdButton,
  AdIcon,
  AdSpeedDial,
  flashToast,
  moduleRequests,
  NucModulesItemOptionsDialog,
  NucModulesItemOptionsInterface,
} from 'nucleify'

import './_index.scss'

const { installModule, toggleModule, uninstallModule } = moduleRequests()

function isModuleInstalled(installed: boolean | undefined): boolean {
  return installed === true
}

function buildSpeedDialItem(
  label: string,
  icon: string,
  onSelect: () => void
): MenuItem {
  return {
    label,
    icon,
    command: (event: MenuItemCommandEvent) => {
      event.originalEvent?.stopPropagation()
      onSelect()
    },
    template: (item, options) => (
      <div
        role="presentation"
        onClick={(event) => {
          event.stopPropagation()
          options.onClick(event)
        }}
      >
        <AdIcon icon={String(item.icon ?? icon)} />
      </div>
    ),
  }
}

export function NucModulesItemOptions({
  name,
  enabled,
  installed,
  onModuleToggled,
  onModuleUninstalled,
}: NucModulesItemOptionsInterface) {
  const router = useRouter()
  const [localInstalled, setLocalInstalled] = useState(() =>
    isModuleInstalled(installed)
  )
  const [localEnabled, setLocalEnabled] = useState(enabled === true)

  useEffect(() => {
    setLocalInstalled(isModuleInstalled(installed))
  }, [installed, name])

  useEffect(() => {
    setLocalEnabled(enabled === true)
  }, [enabled, name])

  const [dialogVisible, setDialogVisible] = useState(false)
  const [currentAction, setCurrentAction] = useState<ModuleDialogAction>(
    localInstalled ? 'uninstall' : 'install'
  )

  useEffect(() => {
    setCurrentAction(localInstalled ? 'uninstall' : 'install')
  }, [localInstalled])

  const openDialog = useCallback((action: ModuleDialogAction) => {
    setCurrentAction(action)
    setDialogVisible(true)
  }, [])

  const handleConfirm = useCallback(
    async (options?: { deleteModuleFiles?: boolean }) => {
      if (!name) {
        flashToast('Module name is required', 'error')
        return
      }

      if (currentAction === 'install') {
        await installModule(name, () => {
          setLocalInstalled(true)
          setLocalEnabled(true)
          void onModuleUninstalled?.()
        })
        return
      }

      if (currentAction === 'uninstall') {
        await uninstallModule(
          name,
          () => {
            setLocalInstalled(false)
            setLocalEnabled(false)
            void onModuleUninstalled?.()
          },
          options?.deleteModuleFiles === true
        )
        return
      }

      const nextEnabled = !localEnabled
      setLocalEnabled(nextEnabled)

      await toggleModule(name, localEnabled, () => {
        void onModuleToggled?.()
      })
    },
    [currentAction, localEnabled, name, onModuleToggled, onModuleUninstalled]
  )

  const model: MenuItem[] = useMemo(
    () => [
      buildSpeedDialItem('Show', 'prime:info-circle', () => {
        void router.push(`/settings#module-${name}`)
      }),
      buildSpeedDialItem(
        localEnabled ? 'Disable' : 'Enable',
        localEnabled ? 'prime:times-circle' : 'prime:check-circle',
        () => openDialog('toggle')
      ),
      buildSpeedDialItem(
        localInstalled ? 'Uninstall' : 'Install',
        localInstalled ? 'prime:trash' : 'prime:download',
        () => openDialog(localInstalled ? 'uninstall' : 'install')
      ),
    ],
    [localEnabled, localInstalled, name, openDialog, router]
  )

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="presentation"
    >
      <AdSpeedDial
        key={`${name}-${localInstalled ? 'installed' : 'uninstalled'}-${localEnabled ? 'enabled' : 'disabled'}`}
        model={model}
        direction="left"
        className="modules-settings-options"
        buttonTemplate={(opts) => (
          <AdButton
            text
            rounded
            icon="prime:ellipsis-h"
            adType={localEnabled ? 'main' : undefined}
            severity={localEnabled ? undefined : 'secondary'}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              opts.onClick?.(event)
            }}
          />
        )}
      />

      <NucModulesItemOptionsDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        name={name}
        enabled={localEnabled}
        action={currentAction}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
