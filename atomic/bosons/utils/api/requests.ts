'use client'

import type { NucModuleRequestsInterface } from 'nucleify'
import { apiHandle, flashToast } from 'nucleify'

export function moduleRequests(): NucModuleRequestsInterface {
  async function installModule(
    name: string,
    onSuccess: () => void | Promise<void>
  ): Promise<void> {
    if (!name) {
      flashToast('Module name is required', 'error')
      return
    }

    await apiHandle({
      url: '/modules/install',
      method: 'POST',
      data: { name },
      onSuccess: async () => {
        flashToast(`Module "${name}" installed successfully`, 'success')
        await onSuccess()
      },
    })
  }

  async function toggleModule(
    name: string,
    enabled: boolean,
    onSuccess: () => void | Promise<void>
  ): Promise<void> {
    if (!name) {
      flashToast('Module name is required', 'error')
      return
    }

    const action = enabled ? 'disabled' : 'enabled'

    await apiHandle({
      url: '/modules/toggle',
      method: 'PATCH',
      data: { name },
      onSuccess: async () => {
        flashToast(`Module "${name}" ${action} successfully`, 'success')
        await onSuccess()
      },
    })
  }

  async function uninstallModule(
    name: string,
    onSuccess: () => void | Promise<void>,
    deleteModuleFiles = false
  ): Promise<void> {
    if (!name) {
      flashToast('Module name is required', 'error')
      return
    }

    await apiHandle({
      url: '/modules/uninstall',
      method: 'POST',
      data: { name, deleteModuleFiles: deleteModuleFiles === true },
      onSuccess: async () => {
        flashToast(`Module "${name}" uninstalled successfully`, 'success')
        await onSuccess()
      },
    })
  }

  return {
    installModule,
    toggleModule,
    uninstallModule,
  }
}
