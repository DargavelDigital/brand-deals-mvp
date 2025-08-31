import { redirect } from 'next/navigation'

export default function Root() {
  // Redirect to dashboard - the middleware will handle locale detection
  // and set the appropriate locale cookie
  redirect('/dashboard')
}
