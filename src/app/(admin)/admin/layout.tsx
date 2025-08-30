"use client"
import * as React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: No custom header here. We inherit the global shell.
  return (
    <div className="container-page py-6 lg:py-8">
      {children}
    </div>
  )
}
