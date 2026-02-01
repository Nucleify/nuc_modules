<template>
  <div v-if="readmeContent" class="readme-content" v-sanitize-html="readmeContent"></div>
  <div v-else-if="loading || showLoading" class="readme-loading">
    <p>Loading documentation...</p>
  </div>
</template>

<script setup lang="ts">
import { loadReadme } from 'atomic'

export interface ModuleReadmeInterface {
  modulePath?: string
  readmeContent?: string
  showLoading?: boolean
}

const props = withDefaults(defineProps<ModuleReadmeInterface>(), {
  showLoading: false,
})

const readmeContent = ref<string>('')
const loading = ref(false)

watch(
  () => props.modulePath,
  async () => {
    if (props.modulePath) {
      loading.value = true
      await loadReadme(
        props.modulePath,
        (html: string) => {
          readmeContent.value = html
          loading.value = false
        },
        () => {
          readmeContent.value = ''
          loading.value = false
        }
      )
    } else if (props.readmeContent) {
      readmeContent.value = props.readmeContent
    } else {
      readmeContent.value = ''
    }
  },
  { immediate: true }
)

watch(
  () => props.readmeContent,
  (newContent: string | undefined) => {
    if (newContent && !props.modulePath) {
      readmeContent.value = newContent
    }
  }
)
</script>

<style lang="scss">
@import '.'
</style>

