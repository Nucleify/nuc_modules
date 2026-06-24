'use client'

import { marked } from 'marked'

import { resolveApiHandleData, resolveApiUrl } from 'nucleify'

function resolveReadmeMarkdown(payload: unknown): string | null {
  const data = resolveApiHandleData<string>(payload)
  return typeof data === 'string' ? data : null
}

export async function loadReadme(
  modulePath: string,
  onSuccess: (html: string) => void,
  onError?: () => void
): Promise<void> {
  if (!modulePath) {
    onError?.()
    return
  }

  try {
    const response = await fetch(
      resolveApiUrl(`/modules/${modulePath}/README.md`),
      {
        credentials: 'include',
        headers: { Accept: 'application/json, text/plain' },
      }
    )

    if (!response.ok) {
      onError?.()
      return
    }

    const contentType = response.headers.get('content-type') ?? ''
    const markdown = contentType.includes('application/json')
      ? resolveReadmeMarkdown(await response.json())
      : await response.text()

    if (!markdown?.trim()) {
      onError?.()
      return
    }

    const html = await marked.parse(markdown)
    onSuccess(html.replaceAll('/public', '/'))
  } catch (error) {
    console.error(`Error loading README for ${modulePath}:`, error)
    onError?.()
  }
}
