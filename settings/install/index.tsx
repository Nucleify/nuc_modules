'use client'

import type { FileUploadFile, ItemTemplateOptions } from 'primereact/fileupload'
import { useState } from 'react'

import type { NucModulesSettingsInstallModuleInterface } from 'nucleify'
import { AdButton, AdDialog, AdFileUpload, useInstallModule } from 'nucleify'

import './_index.scss'

export function NucModulesSettingsInstallModule({
  onModuleInstalled,
}: NucModulesSettingsInstallModuleInterface) {
  const [visible, setVisible] = useState(false)

  const { onBeforeUpload, onUpload, onError, formatSize } = useInstallModule(
    () => {
      setVisible(false)
      onModuleInstalled?.()
    }
  )

  return (
    <>
      <AdButton
        adType="main"
        text
        rounded
        icon="prime:upload"
        className="install-module-button"
        type="button"
        onClick={() => setVisible(true)}
      />

      <AdDialog
        visible={visible}
        onHide={() => setVisible(false)}
        modal
        dismissableMask
        showHeader={false}
        className="install-module-dialog"
      >
        <AdFileUpload
          name="file"
          url="/api/modules/install"
          maxFileSize={1_000_000}
          withCredentials
          onBeforeUpload={onBeforeUpload}
          onUpload={onUpload}
          onError={onError}
          emptyTemplate={<span>Drag and drop files to here to upload.</span>}
          itemTemplate={(file: object, _options: ItemTemplateOptions) => {
            const f = file as FileUploadFile
            return (
              <div key={f.name}>
                <span>{f.name}</span>
                <div>{formatSize(f.size ?? 0)}</div>
              </div>
            )
          }}
        />
      </AdDialog>
    </>
  )
}
