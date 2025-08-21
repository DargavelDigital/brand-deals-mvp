import React from 'react';
import { ds } from './tokens'

// Spacing rules:
// - Never place cards closer than ds.spacing.lg
// - Vertical rhythm = ds.spacing.xl between major blocks, ds.spacing.lg inside cards
// - Use clamp() for padding so it never feels too tight or too airy

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header slot - can be overridden by parent */}
      <header className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">BrandDeals</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Dashboard</a>
              <a href="/brand-run" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Brand Run</a>
              <a href="/tools/workflow" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Workflow</a>
              <a href="/tools/audit" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Tools</a>
              <a href="/settings" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Settings</a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Sidebar slot - can be overridden by parent */}
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-[var(--border)] bg-[var(--panel)] min-h-screen">
          <div className="p-6">
            <nav className="space-y-6">
              <div>
                <a href="/dashboard" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors">Dashboard</a>
                <a href="/brand-run" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors">Brand Run</a>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Tools</div>
                <div className="space-y-2">
                  <a href="/tools/connect" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Connect Accounts</a>
                  <a href="/tools/audit" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">AI Audit</a>
                  <a href="/tools/matches" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Brand Matches</a>
                  <a href="/tools/approve" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Approve Brands</a>
                  <a href="/tools/pack" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Generate Media Pack</a>
                  <a href="/tools/contacts" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Discover Contacts</a>
                  <a href="/tools/outreach" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Start Outreach</a>
                  <a href="/tools/workflow" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Workflow Orchestrator</a>
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">More</div>
                <div className="space-y-2">
                  <a href="/crm" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Deals</a>
                  <a href="/outreach" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Templates</a>
                  <a href="/settings" className="block text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm">Settings</a>
                </div>
              </div>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-6 md:gap-y-8">
      {children}
    </div>
  );
}

export function Col({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={`col-span-12 md:col-span-6 xl:col-span-3 min-w-0 w-auto max-w-none flex-none grow-0 basis-auto ${className}`}>
      {children}
    </div>
  );
}



interface CardProps {
  children: React.ReactNode
  className?: string
  minHeight?: string
}

export function Card({ children, className = '', minHeight = 'auto' }: CardProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
      style={{ 
        minHeight: minHeight === 'auto' ? '110px' : minHeight,
        // Use clamp() for padding so it never feels too tight or too airy
        // inline clamp(14px, 2vw, 20px); block clamp(12px, 1.6vw, 18px)
        padding: `clamp(${ds.spacing.md}px, 1.6vw, ${ds.spacing.lg}px) clamp(${ds.spacing.md}px, 2vw, ${ds.spacing.xl}px)`,
        borderRadius: `${ds.radius.md}px`,
        boxShadow: ds.shadow.tile
      }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-6 pb-0 ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  )
}

interface ChartCardProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function ChartCard({ children, title, description, className = '' }: ChartCardProps) {
  return (
    <Card 
      className={className} 
      minHeight="400px"
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  children: React.ReactNode
  className?: string
}

export function MetricCard({ children, className = '' }: MetricCardProps) {
  return (
    <Card 
      className={className} 
      minHeight="120px"
    >
      <div className="p-6">
        {children}
      </div>
    </Card>
  )
}
