'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'

import type { ModuleDialogAction, ModuleObjectInterface } from 'nucleify'
import {
  AdBadge,
  AdButton,
  AdCard,
  apiRequest,
  flashToast,
  moduleRequests,
  NucCube,
  NucModulesItemOptionsDialog,
  NucModulesSettingsDetailReadmeDialog,
} from 'nucleify'

import './_index.scss'

const { installModule, toggleModule, uninstallModule } = moduleRequests()

function useModuleSlugFromHash(): string | null {
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    function read(): void {
      const h = window.location.hash.replace('#module-', '')
      setSlug(h || null)
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  return slug
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

export function NucModulesSettingsDetail({
  children,
}: {
  children?: ReactNode
}) {
  const router = useRouter()
  const moduleSlug = useModuleSlugFromHash()

  const [moduleData, setModuleData] = useState<ModuleObjectInterface | null>(
    null
  )
  const [readmeDialogVisible, setReadmeDialogVisible] = useState(false)
  const [toggleDialogVisible, setToggleDialogVisible] = useState(false)
  const [installDialogVisible, setInstallDialogVisible] = useState(false)

  const loadModule = useCallback(async () => {
    if (!moduleSlug) {
      setModuleData(null)
      return
    }

    try {
      const response = await apiRequest<ModuleObjectInterface>(
        `/api/modules/${moduleSlug}`
      )
      const data =
        typeof response === 'object' && response !== null && 'data' in response
          ? (response as { data: ModuleObjectInterface }).data
          : (response as ModuleObjectInterface)
      setModuleData(data)
    } catch (error) {
      console.error('Failed to load module:', error)
      setModuleData(null)
    }
  }, [moduleSlug])

  useEffect(() => {
    void loadModule()
  }, [loadModule])

  const module = moduleData
  const moduleInstalled = module?.installed === true
  const installUninstallAction: ModuleDialogAction = moduleInstalled
    ? 'uninstall'
    : 'install'

  async function handleToggleConfirm(): Promise<void> {
    if (!module) return

    const currentEnabled = module.enabled
    const nextEnabled = !currentEnabled
    setModuleData({ ...module, enabled: nextEnabled })

    if (!module.name) {
      flashToast('Module name is required', 'error')
      setModuleData(module)
      return
    }

    await toggleModule(module.name, currentEnabled, () => {
      void loadModule()
    })
  }

  async function handleInstallUninstallConfirm(options?: {
    deleteModuleFiles?: boolean
  }): Promise<void> {
    if (!module?.name) {
      flashToast('Module name is required', 'error')
      return
    }

    if (moduleInstalled) {
      await uninstallModule(
        module.name,
        () => {
          void router.push('/settings#modules')
        },
        options?.deleteModuleFiles === true
      )
      return
    }

    await installModule(module.name, () => {
      void loadModule()
    })
  }

  const header = (
    <div className="modules-settings-detail-header">
      <div className="modules-settings-detail-header-info">
        <span
          title={module?.enabled ? 'Enabled' : 'Disabled'}
          style={{ display: 'inline-flex' }}
        >
          <NucCube shiny={module?.enabled} />
        </span>
        <div>
          <h2>{module?.name || 'Loading...'}</h2>
          {module?.description ? <p>{module.description}</p> : null}
        </div>
      </div>
      <div className="modules-settings-detail-header-actions">
        {module ? (
          <AdButton
            label="Documentation"
            icon="prime:file"
            severity="secondary"
            type="button"
            onClick={() => setReadmeDialogVisible(true)}
          />
        ) : null}
        <AdButton
          label={module?.enabled ? 'Disable' : 'Enable'}
          icon={module?.enabled ? 'prime:times-circle' : 'prime:check-circle'}
          severity="secondary"
          type="button"
          onClick={() => setToggleDialogVisible(true)}
        />
        <AdButton
          label={moduleInstalled ? 'Uninstall' : 'Install'}
          icon={moduleInstalled ? 'prime:trash' : 'prime:download'}
          severity={moduleInstalled ? 'danger' : 'secondary'}
          type="button"
          onClick={() => setInstallDialogVisible(true)}
        />
      </div>
    </div>
  )

  const body = (
    <>
      {module ? (
        <div className="modules-settings-detail-content">
          <div className="modules-settings-detail-info">
            <div className="modules-settings-detail-info-item">
              <label>Version</label>
              <p>{module.version || 'N/A'}</p>
            </div>
            <div className="modules-settings-detail-info-item">
              <label>Category</label>
              <p>{module.category || 'N/A'}</p>
            </div>
            <div className="modules-settings-detail-info-item">
              <label>Status</label>
              <p>
                <AdBadge
                  value={module.enabled ? 'Enabled' : 'Disabled'}
                  severity={module.enabled ? 'success' : 'secondary'}
                />
              </p>
            </div>
            {module.installed !== undefined ? (
              <div className="modules-settings-detail-info-item">
                <label>Installed</label>
                <p>
                  <AdBadge
                    value={module.installed ? 'Yes' : 'No'}
                    severity={module.installed ? 'success' : 'secondary'}
                  />
                </p>
              </div>
            ) : null}
            {module.created_at ? (
              <div className="modules-settings-detail-info-item">
                <label>Created</label>
                <p>{formatDate(module.created_at)}</p>
              </div>
            ) : null}
            {module.updated_at ? (
              <div className="modules-settings-detail-info-item">
                <label>Updated</label>
                <p>{formatDate(module.updated_at)}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="modules-settings-detail-error">
          <p>Module not found</p>
        </div>
      )}
      <div className="modules-settings-detail-settings">{children}</div>
    </>
  )

  return (
    <>
      <AdCard className="modules-settings-detail-card" header={header}>
        {body}
      </AdCard>

      <NucModulesItemOptionsDialog
        visible={toggleDialogVisible}
        onHide={() => setToggleDialogVisible(false)}
        name={module?.name || ''}
        enabled={module?.enabled || false}
        action="toggle"
        onConfirm={handleToggleConfirm}
      />

      <NucModulesItemOptionsDialog
        visible={installDialogVisible}
        onHide={() => setInstallDialogVisible(false)}
        name={module?.name || ''}
        enabled={module?.enabled || false}
        action={installUninstallAction}
        onConfirm={handleInstallUninstallConfirm}
      />

      <NucModulesSettingsDetailReadmeDialog
        visible={readmeDialogVisible}
        onHide={() => setReadmeDialogVisible(false)}
        modulePath={moduleSlug || undefined}
      />
    </>
  )
}
