<template>
  <div class="modules-settings-list">
    <nuc-modules-settings-item 
      v-for="module in props.data"
      v-bind="module"
      :key="module.name"
      @module-toggled="emit('moduleToggled')"
      @module-uninstalled="emit('moduleUninstalled')"
    />
  </div>
</template>

<script setup lang="ts">
import type { NucModulesListInterface } from '.'
import { NucModulesSettingsItem } from '.'

const props = defineProps<NucModulesListInterface>()
const emit = defineEmits(['moduleToggled', 'moduleUninstalled'])
</script>

<style lang="scss">
@import 'index';
</style>