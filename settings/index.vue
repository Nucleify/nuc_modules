<template>
  <ad-card class="modules-settings-card">
    <template #header>
      <nuc-modules-settings-install-module @module-installed="refreshModules" />
    </template>
    <template #content>
      <nuc-modules-list
        :data="modules"
        @module-toggled="refreshModules"
        @module-uninstalled="refreshModules"
      />
    </template>
  </ad-card>
</template>

<script setup lang="ts">
import type { ModuleObjectInterface } from 'nucleify'
import {
  apiRequest,
  NucModulesList,
  NucModulesSettingsInstallModule,
} from 'nucleify'

const modules = ref<ModuleObjectInterface[]>([])

async function loadModules(): Promise<void> {
  const response = await apiRequest<{ modules: ModuleObjectInterface[] }>(
    '/modules/all'
  )

  if (response.modules) {
    modules.value = response.modules
  }
}

async function refreshModules(): Promise<void> {
  await loadModules()
}

onMounted(async () => {
  await loadModules()
})
</script>

<style lang="scss">
@import 'index';
</style>
