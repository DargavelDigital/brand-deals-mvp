'use client';

import { useState, useEffect } from 'react';
import { DashboardGrid, Col } from '@/ui/containers';
import { MetricCard } from '@/components/dashboard/MetricCard';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';

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
        <button
          onClick={toggleTheme}
          className="btn-primary"
        >
          {isDarkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </button>
      </div>

      {/* Hero CTA Section */}
      <Card className="max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--fg)] mb-4">Welcome to Hyper</h1>
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
          <button className="btn-secondary">
            Configure
          </button>
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
            delta={{ value: 12, isPositive: true }}
            badge={{ text: "📈", tone: "green" }}
          />
        </Col>
        <Col>
          <MetricCard
            label="Active Outreach"
            value="8"
            delta={{ value: 3, isPositive: true }}
            badge={{ text: "📧", tone: "blue" }}
          />
        </Col>
        <Col>
          <MetricCard
            label="Response Rate"
            value="68%"
            delta={{ value: 5, isPositive: false }}
            badge={{ text: "📊", tone: "purple" }}
          />
        </Col>
        <Col>
          <MetricCard
            label="Avg Deal Value"
            value="$2.4k"
            delta={{ value: 18, isPositive: true }}
            badge={{ text: "💰", tone: "orange" }}
          />
        </Col>
      </DashboardGrid>

      {/* Additional content sections can go here */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Recent Activity</h2>
        <p className="text-[var(--muted)]">Your dashboard is now using the design system components!</p>
      </div>
    </div>
  );
}
