'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Bell, User, ChevronDown } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar';
import SidebarNav from '@/components/shell/SidebarNav';
import TopbarFrame from '@/components/shell/TopbarFrame';
import { Button } from '@/components/ui/Button';

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
    <div>
      {/* Header slot - can be overridden by parent */}
      <TopbarFrame>
        {/* Left: Brand */}
        <div>
          <h1>HYPER</h1>
          <span>by Hype & Swagger</span>
        </div>
        
        {/* Center: Search Bar */}
        <div>
          <SearchBar 
            placeholder="Search brands, contacts, deals..."
            defaultValue={searchQuery}
            onChange={setSearchQuery}
            size="sm"
          />
        </div>

        {/* Right: User Profile & Actions */}
        <div>
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2">
            <Bell />
          </Button>

          {/* User Profile Dropdown */}
          <div ref={dropdownRef}>
            <Button 
              variant="ghost"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2"
            >
              <div>
                <User />
              </div>
              <span>John Doe</span>
              <ChevronDown />
            </Button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div>
                <Button 
                  onClick={() => handleProfileClick('/profile')}
                >
                  Profile Settings
                </Button>
                <Button 
                  onClick={() => handleProfileClick('/settings')}
                >
                  App Settings
                </Button>
                <Button 
                  onClick={() => handleProfileClick('/billing')}
                >
                  Billing & Plans
                </Button>
                <hr />
                <Button 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </TopbarFrame>
      
      {/* Sidebar slot - can be overridden by parent */}
      <div>
        <SidebarNav />
        
        {/* Main content */}
        <main>
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div>
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
    <div>
      {children}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode
  minHeight?: string
}

export function Card({ children, minHeight = 'auto' }: CardProps) {
  return (
    <div>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
}

export function CardContent({ children }: CardContentProps) {
  return (
    <div>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
}

export function CardTitle({ children }: CardTitleProps) {
  return (
    <h3>
      {children}
    </h3>
  )
}

interface ChartCardProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function ChartCard({ children, title, description }: ChartCardProps) {
  return (
    <Card minHeight="400px">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p>
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
}

export function MetricCard({ children }: MetricCardProps) {
  return (
    <Card minHeight="120px">
      <div>
        {children}
      </div>
    </Card>
  )
}
