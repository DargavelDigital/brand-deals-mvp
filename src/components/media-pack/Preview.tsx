'use client'
import * as React from 'react'

export default function Preview({ current }:{ current: any }){
  // If API also exposes a preview route you can wire it; for now, show last generated HTML/PDF links.
  return (
    <div className="card p-5 md:p-6">
      <div className="text-lg font-semibold mb-2">Preview</div>
      {!current ? (
        <div className="h-72 grid place-items-center text-[var(--muted-fg)]">Generate a pack to see preview</div>
      ) : (
        <div className="space-y-3">
          {current.htmlUrl ? (
            <iframe src={current.htmlUrl} className="w-full h-[460px] rounded-lg border" />
          ) : (
            <div className="h-[220px] grid place-items-center text-[var(--muted-fg)] bg-[var(--surface)] rounded-lg">Preview not available</div>
          )}
          <div className="flex gap-3">
            {current.pdfUrl && (
              <a className="inline-flex h-10 items-center rounded-[10px] px-4 border border-[var(--border)] bg-[var(--card)]"
                 href={current.pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
            )}
            {current.htmlUrl && (
              <a className="inline-flex h-10 items-center rounded-[10px] px-4 bg-[var(--brand-600)] text-white"
                 href={current.htmlUrl} target="_blank" rel="noreferrer">Open Web Version</a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
