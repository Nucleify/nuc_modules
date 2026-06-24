<template>
  <ad-button
    ad-type="main"
    text
    rounded
    icon="prime:trash"
    class="uninstall-module-button"
    @click="uninstallModule(props.name, () => emit('moduleUninstalled'))"
  />
</template>

<script setup lang="ts">
import { moduleRequests } from 'nucleify'
import type { NucModulesUninstallModuleInterface } from 'nucleify'

const props = defineProps<NucModulesUninstallModuleInterface>()

const emit = defineEmits<{
  moduleUninstalled: []
}>()

const { uninstallModule } = moduleRequests()
</script>

<style lang="scss">
@import 'index';
</style>
