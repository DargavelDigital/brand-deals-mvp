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
    <div>
      {/* Theme Toggle */}
      <div>
        <Button
          onClick={toggleTheme}
        >
          {isDarkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </Button>
      </div>

      {/* Hero CTA Section */}
      <Card>
        <h1>Welcome to Hyper</h1>
        <p>
          Start your brand run to audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.
        </p>
        <div>
          <Button asChild>
            <a href="/brand-run">
              Start Brand Run
            </a>
          </Button>
          <Button>
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
            icon={<TrendingUp />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Active Outreach"
            value="8"
            delta="+3"
            icon={<Mail />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Response Rate"
            value="68%"
            delta="-5"
            icon={<BarChart3 />}
          />
        </Col>
        <Col>
          <MetricCard
            label="Avg Deal Value"
            value="$2.4k"
            delta="+18"
            icon={<DollarSign />}
          />
        </Col>
      </DashboardGrid>

      {/* Quick Actions Section */}
      <div>
        <h2>Quick Actions</h2>
        <div>
          <QuickAction icon={<Rocket />}>
            Start Brand Run
          </QuickAction>
          <QuickAction icon={<Wrench />}>
            Tools
          </QuickAction>
          <QuickAction icon={<Users />}>
            Manage Contacts
          </QuickAction>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2>Recent Activity</h2>
        <div>
          <ActivityItem
            dot="green"
            title="Brand Run Started"
            meta="2 minutes ago"
          />
          <ActivityItem
            dot="blue"
            title="AI Audit Completed"
            meta="5 minutes ago"
          />
        </div>
      </div>
    </div>
  );
}
