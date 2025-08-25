'use client';

import { ReactNode } from 'react'
import Topbar from '@/components/shell/Topbar'
import Sidebar from '@/components/shell/Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="container-max">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`container-max ${className}`}>
      {children}
    </div>
  )
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
    <div className={`card ${className}`}>
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
    <h3 className={`text-lg font-semibold text-[var(--fg)] ${className}`}>
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
          <p className="text-sm text-[var(--muted-fg)] mt-1">
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
