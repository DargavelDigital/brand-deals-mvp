import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const { email } = await request.json()
  
  if (!email) {
    return new Response('Email required', { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_email', email, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  redirect('/admin')
}

export async function GET() {
  return new Response(`
    <html>
      <body>
        <h1>Admin Login</h1>
        <form method="POST">
          <input type="email" name="email" placeholder="admin@example.com" required />
          <button type="submit">Login as Admin</button>
        </form>
        <script>
          document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault()
            const email = e.target.email.value
            await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            })
            window.location.href = '/admin'
          })
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
