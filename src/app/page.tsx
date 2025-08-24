import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-[var(--fg)]">
            Hyper
          </h1>
          <p className="text-xl text-[var(--muted-fg)] font-medium">
            by Hype & Swagger
          </p>
        </div>
        
        <p className="text-lg text-[var(--muted-fg)] max-w-md mx-auto">
          The ultimate platform for creators to discover brand partnerships and grow their business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="md" className="text-lg px-8 py-3">
            <a href="/dashboard">
              Get Started
            </a>
          </Button>
          <Button asChild variant="secondary" size="md" className="text-lg px-8 py-3">
            <a href="/brand-run">
              Start Brand Run
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
