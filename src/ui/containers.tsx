'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ds } from './tokens'
import { Bell, User, ChevronDown } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar';
import SidebarNav from '@/components/ui/SidebarNav';

// Spacing rules:
// - Never place cards closer than ds.spacing.lg
// - Vertical rhythm = ds.spacing.xl between major blocks, ds.spacing.lg inside cards
// - Use clamp() for padding so it never feels too tight or too airy

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    // TODO: Implement actual sign out logic with your auth provider
    console.log('Sign out clicked');
    
    // Clear any local storage or cookies
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Redirect to login page (adjust path as needed)
    router.push('/auth/signin');
  };

  const handleProfileClick = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
      // You can add your search logic here
      // For example: router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header slot - can be overridden by parent */}
      <header className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="container max-w-[1400px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-xl font-semibold text-[var(--text)]">HYPER</h1>
              <span className="ml-2 text-sm text-[var(--muted)]">by Hype & Swagger</span>
            </div>
            
            {/* Center: Search Bar */}
            <div className="flex-1 max-w-3xl mx-8">
              <SearchBar 
                placeholder="Search brands, contacts, deals..."
                defaultValue={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Notifications */}
              <button className="p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                <Bell className="h-6 w-6" />
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-[var(--text)] hover:bg-[var(--card)] rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[var(--brand)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">John Doe</span>
                  <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50">
                    <button 
                      onClick={() => handleProfileClick('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--panel)] transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => handleProfileClick('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--panel)] transition-colors"
                    >
                      App Settings
                    </button>
                    <button 
                      onClick={() => handleProfileClick('/billing')}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--panel)] transition-colors"
                    >
                      Billing & Plans
                    </button>
                    <hr className="my-1 border-[var(--border)]" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--panel)] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar slot - can be overridden by parent */}
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-[var(--border)] bg-[var(--panel)] min-h-screen">
          <div className="p-6">
            <SidebarNav />
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
