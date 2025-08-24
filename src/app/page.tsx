import { redirect } from 'next/navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-[var(--text)]">
            Hyper
          </h1>
          <p className="text-xl text-[var(--muted)] font-medium">
            by Hype & Swagger
          </p>
        </div>
        
        <p className="text-lg text-[var(--muted)] max-w-md mx-auto">
          The ultimate platform for creators to discover brand partnerships and grow their business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/dashboard" 
            className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Get Started
          </a>
          <a 
            href="/brand-run" 
            className="px-8 py-3 text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]"
          >
            Start Brand Run
          </a>
        </div>
      </div>
    </div>
  );
}
