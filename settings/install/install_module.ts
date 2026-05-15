import type { UseToastInterface } from 'nucleify'
import { apiHandle, useAtomicToast } from 'nucleify'

export async function installModule(
  name: string,
  onSuccess: () => void
): Promise<void> {
  const { flashToast }: UseToastInterface = useAtomicToast()

  if (!name) {
    flashToast('Module name is required', 'error')
    return
  }

  await apiHandle({
    url: apiUrl() + '/modules/install',
    method: 'POST',
    data: { name },
    onSuccess: () => {
      flashToast(`Module "${name}" installed successfully`, 'success')
      onSuccess()
    },
  })
}
