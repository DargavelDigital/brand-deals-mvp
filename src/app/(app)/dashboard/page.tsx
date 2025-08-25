'use client';

import { useState, useEffect } from 'react';
import { DashboardGrid, Col } from '@/ui/containers';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import QuickAction from '@/components/ui/QuickAction';
import ActivityItem from '@/components/ui/ActivityItem';
import { Plus, Rocket, Wrench, Users, TrendingUp, Mail, BarChart3, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled via cookie
    const darkCookie = document.cookie.includes('theme=dark');
    setIsDarkMode(darkCookie);
    
    // Apply theme to document
    if (darkCookie) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Set/remove cookie
    if (newDarkMode) {
      document.cookie = 'theme=dark; path=/; max-age=31536000'; // 1 year
      document.documentElement.classList.add('dark');
    } else {
      document.cookie = 'theme=light; path=/; max-age=31536000'; // 1 year
      document.documentElement.classList.remove('dark');
    }
    
    // Force a page reload to ensure all styles are applied
    window.location.reload();
  };

  return (
    <div className="container space-y-8">
      {/* Theme Toggle */}
      <div className="flex justify-end">
        <Button
          onClick={toggleTheme}
        >
          {isDarkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </Button>
      </div>

      {/* Hero CTA Section */}
      <Card className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Welcome to Hyper</h1>
        <p className="text-lg text-[var(--muted-fg)] mb-6">
          Start your brand run to audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/brand-run" 
            className="btn-primary text-center"
          >
            Start Brand Run
          </a>
          <Button variant="secondary">
            Configure
          </Button>
        </div>
      </Card>

      <SectionHeading 
        title="Performance Overview" 
        subtitle="Your brand deals performance metrics" 
      />

      {/* KPI Metrics Row */}
      <DashboardGrid>
        <Col>
          <MetricCard
            label="Total Deals"
            value="24"
            delta="+12"
            icon={<TrendingUp className="size-4" />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Active Outreach"
            value="8"
            delta="+3"
            icon={<Mail className="size-4" />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Response Rate"
            value="68%"
            delta="-5"
            icon={<BarChart3 className="size-4" />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Avg Deal Value"
            value="$2.4k"
            delta="+18"
            icon={<DollarSign className="size-4" />}
          />
        </Col>
      </DashboardGrid>

      {/* Quick Actions Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction icon={<Rocket className="size-4" />}>
            Start Brand Run
          </QuickAction>
          <QuickAction icon={<Wrench className="size-4" />}>
            Tools
          </QuickAction>
          <QuickAction icon={<Users className="size-4" />}>
            Manage Contacts
          </QuickAction>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem 
            title="New contact added" 
            meta="2 min ago" 
          />
          <ActivityItem 
            title="Brand Run completed" 
            meta="1 hour ago" 
            dot="var(--success)"
          />
          <ActivityItem 
            title="Outreach sequence started" 
            meta="3 hours ago" 
            dot="var(--brand-600)"
          />
        </div>
      </div>
    </div>
  );
}
