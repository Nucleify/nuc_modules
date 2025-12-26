<template>
  <div 
    class="modules-settings-list-item"
    :class="{ 'active': props.enabled }" 
  >
    <nuc-cube
      :shiny="props.enabled"
      v-tooltip.right="props.enabled ? 'Enabled' : 'Disabled'" 
    />
    <div class="modules-settings-list-item-container">
      <div class="modules-settings-list-item-info">
        <label>{{ props.name }}</label>
        <p>{{ props.description }}</p>
      </div>
      <nuc-modules-list-item-options v-bind="props" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModuleObjectInterface } from 'atomic'

import { NucModulesListItemOptions } from '.'

const props = defineProps<ModuleObjectInterface>()
</script>