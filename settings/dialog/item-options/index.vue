<template>
  <ad-dialog
    v-model:visible="visible"
    class="modules-settings-options-dialog"
    :modal="true"
    :header="config.header"
  >
    <p>
      Are you sure you want to {{ config.actionVerb }}
      <strong>{{ props.name }}</strong>?
    </p>
    <div
      v-if="props.action === 'uninstall'"
      class="modules-settings-options-dialog__delete-files"
    >
      <ad-checkbox
        v-model="deleteModuleFiles"
        binary
        input-id="delete-module-files"
      />
      <label
        for="delete-module-files"
        class="modules-settings-options-dialog__delete-files-label"
      >
        {{ t('modules-uninstall-delete-files-label') }}
      </label>
      <p class="modules-settings-options-dialog__delete-files-hint">
        {{ t('modules-uninstall-delete-files-hint') }}
      </p>
    </div>
    <template #footer>
      <ad-button
        label="Cancel"
        icon="prime:times"
        severity="secondary"
        text
        rounded
        @click="visible = false"
      />
      <ad-button
        :label="config.label"
        :icon="config.icon"
        :severity="config.severity"
        ad-type="main"
        text
        rounded
        @click="handleConfirm"
      />
    </template>
  </ad-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ModuleDialogInterface } from 'nucleify'

const props = defineProps<ModuleDialogInterface>()
const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{
  confirm: [payload?: { deleteModuleFiles?: boolean }]
}>()

const { t } = useI18n()
const deleteModuleFiles = ref(false)

const config = computed(() => {
  if (props.action === 'install') {
    return {
      header: 'Confirm Install',
      actionVerb: 'install',
      label: 'Install',
      icon: 'prime:download',
      severity: 'success' as const,
    }
  }

  if (props.action === 'uninstall') {
    return {
      header: 'Confirm Uninstall',
      actionVerb: 'uninstall',
      label: 'Uninstall',
      icon: 'prime:trash',
      severity: 'danger' as const,
    }
  }

  return {
    header: props.enabled ? 'Confirm Disable' : 'Confirm Enable',
    actionVerb: props.enabled ? 'disable' : 'enable',
    label: props.enabled ? 'Disable' : 'Enable',
    icon: props.enabled ? 'prime:times-circle' : 'prime:check-circle',
    severity: 'secondary' as const,
  }
})

function handleConfirm(): void {
  visible.value = false

  if (props.action === 'uninstall') {
    emit('confirm', { deleteModuleFiles: deleteModuleFiles.value })
    deleteModuleFiles.value = false
    return
  }

  emit('confirm')
}
</script>

<style lang="scss">
@import 'index';
</style>
