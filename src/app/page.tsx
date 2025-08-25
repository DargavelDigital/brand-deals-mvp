import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div>
      <div>
        <div>
          <h1>
            Hyper
          </h1>
          <p>
            The ultimate platform for creators to discover brand partnerships and grow their business.
          </p>
        </div>
        <p>
          AI-powered brand discovery, automated outreach, and professional media packs.
        </p>
        <div>
          <Button asChild>
            <Link href="/dashboard">
              Get Started
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tools">
              Explore Tools
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
