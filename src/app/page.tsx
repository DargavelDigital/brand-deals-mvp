import { redirect } from 'next/navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Test element to verify theme */}
        <div 
          className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-card)]"
          style={{
            backgroundColor: 'oklch(0.995 0.004 95)',
            color: 'oklch(0.22 0.03 265)',
            border: '1px solid oklch(0.88 0.015 260)',
            boxShadow: '0 1px 1px rgba(0,0,0,.05), 0 8px 16px rgba(0,0,0,.08)'
          }}
        >
          <p className="text-[var(--fg)]">Theme Test: This should have clean white background and dark text</p>
          <p style={{ color: 'oklch(0.22 0.03 265)' }}>Inline style test: Dark text</p>
        </div>
        
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
          <a 
            href="/dashboard" 
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started
          </a>
          <a 
            href="/brand-run" 
            className="btn-secondary text-lg px-8 py-3"
          >
            Start Brand Run
          </a>
        </div>
      </div>
    </div>
  );
}
