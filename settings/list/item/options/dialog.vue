<template>
  <ad-dialog 
    v-model:visible="visible" 
    :header="config.header"
    class="modules-settings-options-dialog"
  >
    <p>Are you sure you want to {{ config.action }} <strong>{{ props.name }}</strong>?</p>
    <template #footer>
      <ad-button
        label="Cancel"
        icon="prime:times"
        ad-type="secondary"
        severity="secondary"
        text
        rounded
        @click="visible = false"
      />
      <ad-button 
        :label="config.label" 
        :icon="config.icon" 
        ad-type="main"
        text 
        rounded 
        @click="confirm" 
      />
    </template>
  </ad-dialog>
</template>

<script setup lang="ts">
import type { ModuleDialogInterface } from '.'

const props = defineProps<ModuleDialogInterface>()
const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits(['confirm'])

const config = computed(() => {
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
  emit('confirm')
  visible.value = false
}
</script>

