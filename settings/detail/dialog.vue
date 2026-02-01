<template>
  <ad-dialog
    v-model:visible="visible"
    class="modules-settings-readme-dialog"
    :modal="true"
    :dismissable-mask="true"
  >
    <nuc-modules-readme :module-path="props.modulePath" :show-loading="true" />
    <template #footer>
      <ad-button
        label="Close"
        icon="prime:times"
        severity="secondary"
        text
        rounded
        @click="visible = false"
      />
    </template>
  </ad-dialog>
</template>

<script setup lang="ts">
import { NucModulesReadme } from 'atomic'

import type { ModuleReadmeDialogInterface } from './types'

const props = defineProps<ModuleReadmeDialogInterface>()
const visible = defineModel<boolean>('visible', { default: false })
</script>

<style lang="scss">
@import './_dialog.scss';
</style>
