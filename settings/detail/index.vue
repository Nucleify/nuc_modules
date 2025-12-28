<template>
  <ad-card class="modules-settings-detail-card">
    <template #header>
      <div class="modules-settings-detail-header">
        <div class="modules-settings-detail-header-info">
          <nuc-cube
            :shiny="module?.enabled"
            v-tooltip.right="module?.enabled ? 'Enabled' : 'Disabled'" 
          />
          <div>
            <h2>{{ module?.name || 'Loading...' }}</h2>
            <p v-if="module?.description">{{ module.description }}</p>
          </div>
        </div>
        <div class="modules-settings-detail-header-actions">
          <ad-button
            :label="module?.enabled ? 'Disable' : 'Enable'"
            :icon="module?.enabled ? 'prime:times-circle' : 'prime:check-circle'"
            severity="secondary"
            @click="openToggleDialog"
          />
          <ad-button
            label="Uninstall"
            icon="prime:trash"
            ad-type="danger"
            severity="danger"
            @click="openUninstallDialog"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div v-if="module" class="modules-settings-detail-content">
        <div class="modules-settings-detail-info">
          <div class="modules-settings-detail-info-item">
            <label>Version</label>
            <p>{{ module.version || 'N/A' }}</p>
          </div>
          <div class="modules-settings-detail-info-item">
            <label>Category</label>
            <p>{{ module.category || 'N/A' }}</p>
          </div>
          <div class="modules-settings-detail-info-item">
            <label>Status</label>
            <p>
              <ad-badge
                :value="module.enabled ? 'Enabled' : 'Disabled'"
                :severity="module.enabled ? 'success' : 'secondary'"
              />
            </p>
          </div>
          <div class="modules-settings-detail-info-item" v-if="module.installed !== undefined">
            <label>Installed</label>
            <p>
              <ad-badge
                :value="module.installed ? 'Yes' : 'No'"
                :severity="module.installed ? 'success' : 'secondary'"
              />
            </p>
          </div>
          <div class="modules-settings-detail-info-item" v-if="module.created_at">
            <label>Created</label>
            <p>{{ formatDate(module.created_at) }}</p>
          </div>
          <div class="modules-settings-detail-info-item" v-if="module.updated_at">
            <label>Updated</label>
            <p>{{ formatDate(module.updated_at) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="modules-settings-detail-error">
        <p>Module not found</p>
      </div>
      <div class="modules-settings-detail-settings">
        <slot />
      </div>
    </template>
  </ad-card>

  <nuc-modules-item-options-dialog
    v-model:visible="toggleDialogVisible"
    :name="module?.name || ''"
    :enabled="module?.enabled || false"
    action="toggle"
    @confirm="handleToggle"
  />

  <nuc-modules-item-options-dialog
    v-model:visible="uninstallDialogVisible"
    :name="module?.name || ''"
    :enabled="module?.enabled || false"
    action="uninstall"
    @confirm="handleUninstall"
  />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'nuxt/app'
import { computed, onMounted, ref, watch } from 'vue'

import type { ModuleObjectInterface } from 'atomic'
import { apiRequest, toggleModule, uninstallModule } from 'atomic'

import { NucModulesItemOptionsDialog } from '../list/item/options'

const route = useRoute()
const router = useRouter()

const moduleData = ref<ModuleObjectInterface | null>(null)
const loading = ref(true)
const toggleDialogVisible = ref(false)
const uninstallDialogVisible = ref(false)

const moduleName = computed(() => {
  const hash = route.hash.replace('#module-', '')
  console.log(hash)
  return hash || null
})

const module = computed(() => moduleData.value)

async function loadModule(): Promise<void> {
  if (!moduleName.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await apiRequest<ModuleObjectInterface>(
      apiUrl() + '/modules/' + moduleName.value
    )

    const data = 'data' in response ? response.data : response
    moduleData.value = data as ModuleObjectInterface
  } catch (error) {
    console.error('Failed to load module:', error)
    moduleData.value = null
  } finally {
    loading.value = false
  }
}

function openToggleDialog(): void {
  toggleDialogVisible.value = true
}

function openUninstallDialog(): void {
  uninstallDialogVisible.value = true
}

async function handleToggle(): Promise<void> {
  if (!module.value || !moduleData.value) return

  const currentEnabled = module.value.enabled

  // Optimistically update the state
  moduleData.value.enabled = !currentEnabled

  await toggleModule(module.value.name, currentEnabled, async () => {
    // Reload to get fresh data from server
    await loadModule()
  })
}

async function handleUninstall(): Promise<void> {
  if (!module.value) return

  await uninstallModule(module.value.name, async () => {
    router.push('/settings#modules')
  })
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

watch(
  () => route.hash,
  async () => {
    await loadModule()
  },
  { immediate: true }
)

onMounted(async () => {
  await loadModule()
})
</script>

<style lang="scss">
@import '.'
</style>

