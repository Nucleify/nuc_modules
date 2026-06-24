'use client'

import { useEffect, useState } from 'react'

import type { ModuleReadmeInterface } from 'nucleify'
import { loadReadme } from 'nucleify'

import './_index.scss'

export function NucModulesReadme({
  modulePath,
  readmeContent: readmeContentProp,
  showLoading = false,
}: ModuleReadmeInterface) {
  const [readmeContent, setReadmeContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run(): Promise<void> {
      if (modulePath) {
        setLoading(true)
        await loadReadme(
          modulePath,
          (html) => {
            if (!cancelled) {
              setReadmeContent(html)
              setLoading(false)
            }
          },
          () => {
            if (!cancelled) {
              setReadmeContent('')
              setLoading(false)
            }
          }
        )
      } else if (readmeContentProp) {
        setReadmeContent(readmeContentProp)
        setLoading(false)
      } else {
        setReadmeContent('')
        setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [modulePath, readmeContentProp])

  if (readmeContent) {
    return (
      <div
        className="readme-content"
        dangerouslySetInnerHTML={{ __html: readmeContent }}
      />
    )
  }

  if (loading || showLoading) {
    return (
      <div className="readme-loading">
        <p>Loading documentation...</p>
      </div>
    )
  }

  return null
}
