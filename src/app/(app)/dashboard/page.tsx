'use client';

import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Plus,
  Send,
  FileText,
  Zap
} from 'lucide-react'
import MetricCard from '@/components/ui/MetricCard'
import QuickAction from '@/components/ui/QuickAction'
import ActivityItem from '@/components/ui/ActivityItem'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted-fg)] mt-2">Welcome back! Here's what's happening with your creator business.</p>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Revenue" 
          value="$24,500" 
          delta="+12.5%" 
          icon={<DollarSign className="size-4" />} 
        />
        <MetricCard 
          label="Active Contacts" 
          value="1,247" 
          delta="+8.2%" 
          icon={<Users className="size-4" />} 
        />
        <MetricCard 
          label="Conversion Rate" 
          value="3.2%" 
          delta="+0.8%" 
          icon={<TrendingUp className="size-4" />} 
        />
        <MetricCard 
          label="Brand Deals" 
          value="23" 
          delta="+15.4%" 
          icon={<Target className="size-4" />} 
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction 
              label="Create Content" 
              icon={<Plus className="size-4" />} 
            />
            <QuickAction 
              label="Send Outreach" 
              icon={<Send className="size-4" />} 
            />
            <QuickAction 
              label="Generate Pack" 
              icon={<FileText className="size-4" />} 
            />
            <QuickAction 
              label="Run Audit" 
              icon={<Zap className="size-4" />} 
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem 
              title="New contact added" 
              meta="2 min ago" 
              dot="var(--success)"
            />
            <ActivityItem 
              title="Brand deal closed" 
              meta="15 min ago" 
              dot="var(--brand-500)"
            />
            <ActivityItem 
              title="Content published" 
              meta="1 hour ago" 
              dot="var(--success)"
            />
            <ActivityItem 
              title="Outreach sent" 
              meta="2 hours ago" 
              dot="var(--warning)"
            />
            <ActivityItem 
              title="Audit completed" 
              meta="3 hours ago" 
              dot="var(--success)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
