<template>
  <ad-dialog
    v-model:visible="visible"
    :header="config.header"
    class="modules-settings-options-dialog"
  >
    <p>
      Are you sure you want to {{ config.action }}
      <strong>{{ props.name }}</strong>?
    </p>
    <div
      v-if="props.action === 'uninstall'"
      class="modules-settings-options-dialog__delete-files"
    >
      <ad-checkbox
        v-model="deleteModuleFiles"
        input-id="modules-uninstall-delete-files"
        binary
        ad-type="main"
      />
      <ad-label
        class="modules-settings-options-dialog__delete-files-label"
        for-input="modules-uninstall-delete-files"
        label="modules-uninstall-delete-files-label"
      />
      <p class="modules-settings-options-dialog__delete-files-hint">
        {{ t('modules-uninstall-delete-files-hint') }}
      </p>
    </div>
    <template #footer>
      <ad-button
        label="Cancel"
        icon="prime:times"
        severity="secondary"
        @click="visible = false"
      />
      <ad-button
        :label="config.label"
        :icon="config.icon"
        :severity="config.severity"
        @click="confirm"
      />
    </template>
  </ad-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { ModuleDialogInterface } from '.'

const props = defineProps<ModuleDialogInterface>()
const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{
  confirm: [payload?: { deleteModuleFiles?: boolean }]
}>()

const { t } = useI18n()
const deleteModuleFiles = ref(false)

watch(visible, (isOpen) => {
  if (isOpen) deleteModuleFiles.value = false
})

const config = computed(() => {
  if (props.action === 'install') {
    return {
      header: 'Confirm Install',
      action: 'install',
      label: 'Install',
      icon: 'prime:download',
      severity: 'success',
    }
  }
  if (props.action === 'uninstall') {
    return {
      header: 'Confirm Uninstall',
      action: 'uninstall',
      label: 'Uninstall',
      icon: 'prime:trash',
      severity: 'danger',
    }
  }
  return {
    header: props.enabled ? 'Confirm Disable' : 'Confirm Enable',
    action: props.enabled ? 'disable' : 'enable',
    label: props.enabled ? 'Disable' : 'Enable',
    icon: props.enabled ? 'prime:times-circle' : 'prime:check-circle',
  }
})

const confirm = () => {
  if (props.action === 'uninstall') {
    emit('confirm', { deleteModuleFiles: deleteModuleFiles.value })
  } else {
    emit('confirm', {})
  }
  visible.value = false
}
</script>
