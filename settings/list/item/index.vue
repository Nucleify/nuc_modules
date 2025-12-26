<template>
  <div 
    class="modules-settings-item"
    :class="{ 'active': props.enabled }" 
  >
    <nuc-cube
      :shiny="props.enabled"
      v-tooltip.right="props.enabled ? 'Enabled' : 'Disabled'" 
    />
    <div class="modules-settings-item-container">
      <div class="modules-settings-item-info">
        <label>{{ props.name }}</label>
        <p>{{ props.description }}</p>
      </div>
      <nuc-modules-item-options 
        v-bind="props"
        @module-toggled="emit('moduleToggled')"
        @module-uninstalled="emit('moduleUninstalled')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModuleObjectInterface } from 'atomic'

import { NucModulesItemOptions } from '.'

const props = defineProps<ModuleObjectInterface>()
const emit = defineEmits(['moduleToggled', 'moduleUninstalled'])
</script>