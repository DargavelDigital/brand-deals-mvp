import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-text">
            Hyper
          </h1>
          <p className="text-xl text-muted">
            The ultimate platform for creators to discover brand partnerships and grow their business.
          </p>
        </div>
        <p className="text-muted">
          AI-powered brand discovery, automated outreach, and professional media packs.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/tools">
              Explore Tools
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
