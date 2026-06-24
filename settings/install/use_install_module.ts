'use client'

import { flashToast } from 'nucleify'

function getXsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined

  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

function parseXhrErrorMessage(xhr: XMLHttpRequest): string {
  try {
    const data = JSON.parse(xhr.responseText) as {
      error?: string
      errors?: string
      message?: string
    }
    return (
      data.error ||
      data.errors ||
      data.message ||
      xhr.statusText ||
      'Failed to install module'
    )
  } catch {
    return xhr.statusText || 'Failed to install module'
  }
}

export function formatModuleUploadSize(bytes: number): string {
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return `0 ${sizes[0]}`
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function useInstallModule(onSuccess: () => void) {
  // biome-ignore lint/suspicious/noExplicitAny: PrimeVue/PrimeReact FileUpload xhr event
  function onBeforeUpload(event: any) {
    try {
      const xsrfToken = getXsrfToken()

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Referer-Slug': window.location.pathname,
      }

      if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken
      }

      const originalOpen = event.xhr.open
      event.xhr.open = function (
        method: string,
        url: string,
        async: boolean,
        user?: string,
        password?: string
      ) {
        const result = originalOpen.call(
          this,
          method,
          url,
          async,
          user,
          password
        )

        Object.entries(headers).forEach(([key, value]) => {
          this.setRequestHeader(key, value)
        })

        return result
      }

      return event
    } catch {
      flashToast('Error preparing upload', 'error')
      return false
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: PrimeVue/PrimeReact FileUpload xhr event
  function onUpload(event?: any): void {
    const xhr = event?.xhr as XMLHttpRequest | undefined
    if (xhr && xhr.status >= 400) {
      flashToast(parseXhrErrorMessage(xhr), 'error')
      return
    }

    flashToast('Module installed successfully', 'success')
    onSuccess()
  }

  // biome-ignore lint/suspicious/noExplicitAny: PrimeVue/PrimeReact FileUpload xhr event
  function onError(event?: any): void {
    const xhr = event?.xhr as XMLHttpRequest | undefined
    flashToast(
      xhr ? parseXhrErrorMessage(xhr) : 'Failed to install module',
      'error'
    )
  }

  return {
    onBeforeUpload,
    beforeUpload: onBeforeUpload,
    onUpload,
    onError,
    formatSize: formatModuleUploadSize,
  }
}
