import type { UseToastInterface } from 'atomic'
import { apiHandle, useAtomicToast } from 'atomic'

export async function toggleModule(
  name: string,
  enabled: boolean,
  onSuccess: () => void
): Promise<void> {
  const { flashToast }: UseToastInterface = useAtomicToast()

  if (!name) {
    flashToast('Module name is required', 'error')
    return
  }

  const action = enabled ? 'disabled' : 'enabled'

  await apiHandle({
    url: apiUrl() + '/modules/toggle',
    method: 'PATCH',
    data: { name },
    onSuccess: () => {
      flashToast(`Module "${name}" ${action} successfully`, 'success')
      onSuccess()
    },
  })
}
