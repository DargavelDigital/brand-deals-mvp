'use client'

interface ExportUserButtonProps {
  userId: string
  userEmail: string
}

export function ExportUserButton({ userId, userEmail }: ExportUserButtonProps) {
  const handleExport = () => {
    console.log(`[Export] Downloading data for user: ${userId} (${userEmail})`)
  }
  
  return (
    <a
      href={`/api/admin/export/user/${userId}`}
      download
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors inline-block"
    >
      📥 Export Data
    </a>
  )
}

