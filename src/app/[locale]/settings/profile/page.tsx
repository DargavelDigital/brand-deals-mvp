import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileForm from './ProfileForm'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get full user data
  const user = await prisma().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  )
}

