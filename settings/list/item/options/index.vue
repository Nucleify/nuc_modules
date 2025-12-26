<template>
  <speed-dial 
    :model="items"
    direction="left"
    class="modules-settings-list-item-options"
  >
    <template #button="{ toggleCallback }">
      <ad-button text rounded icon="prime:ellipsis-h" @click="toggleCallback" />
    </template>
    <template #item="{ item, toggleCallback }">
      <div @click="toggleCallback">
        <ad-icon :icon="item.icon" @click="item.command" v-tooltip.top="item.label" />
      </div>
    </template>
  </speed-dial>
</template>

<script setup lang="ts">
import type { ModuleObjectInterface } from 'atomic'

import { uninstallModule } from 'atomic'

const props = defineProps<ModuleObjectInterface>()
const emit = defineEmits(['moduleUninstalled'])
const router = useRouter()

const items = ref([
  {
    label: 'Show',
    icon: 'prime:info-circle',
    command: () => {
      router.push(`/settings#module-${props.name}`)
    }
  },
  {
    label: props.enabled ? 'Disable' : 'Enable',
    icon: props.enabled ? 'prime:times-circle' : 'prime:check-circle',
    command: () => {
      console.log('enable')
    }
  },
  {
    label: 'Uninstall',
    icon: 'prime:trash',
    command: () => {
      uninstallModule(props.name, () => emit('moduleUninstalled'))
    }
  },
])
</script>

<style lang="scss">
@import '.'
</style>