import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
