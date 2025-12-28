<template>
  <SpeedDial
    :model="items"
    direction="left"
    class="modules-settings-options"
    @click.stop
  >
    <template #button="{ toggleCallback }">
      <ad-button 
        text
        rounded
        icon="prime:ellipsis-h"
        :ad-type="props.enabled && 'main'"
        :severity="!props.enabled && 'secondary'"
        @click="toggleCallback"
      />
    </template>
    <template #item="{ item, toggleCallback }">
      <div @click="toggleCallback">
        <ad-icon :icon="item.icon" @click="item.command" v-tooltip.top="item.label" />
      </div>
    </template>
  </SpeedDial>

  <nuc-modules-item-options-dialog
    v-model:visible="dialogVisible"
    :name="props.name"
    :enabled="props.enabled"
    :action="currentAction"
    @confirm="confirmAction"
  />
</template>

<script setup lang="ts">
import type { ModuleObjectInterface } from 'atomic'
import { toggleModule, uninstallModule } from 'atomic'

import { type ModuleDialogAction, NucModulesItemOptionsDialog } from '.'

const props = defineProps<ModuleObjectInterface>()
const emit = defineEmits(['moduleToggled', 'moduleUninstalled'])
const router = useRouter()

const dialogVisible = ref(false)
const currentAction = ref<ModuleDialogAction>('uninstall')

const openDialog = (action: ModuleDialogAction) => {
  currentAction.value = action
  dialogVisible.value = true
}

const confirmAction = () => {
  if (currentAction.value === 'uninstall') {
    uninstallModule(props.name, () => emit('moduleUninstalled'))
  } else {
    toggleModule(props.name, props.enabled, () => emit('moduleToggled'))
  }
}

const items = computed(() => [
  {
    label: 'Show',
    icon: 'prime:info-circle',
    command: () => {
      router.push(`/settings#module-${props.name}`)
    },
  },
  {
    label: props.enabled ? 'Disable' : 'Enable',
    icon: props.enabled ? 'prime:times-circle' : 'prime:check-circle',
    command: () => openDialog('toggle'),
  },
  {
    label: 'Uninstall',
    icon: 'prime:trash',
    command: () => openDialog('uninstall'),
  },
])
</script>

<style lang="scss">
@import '.'
</style>