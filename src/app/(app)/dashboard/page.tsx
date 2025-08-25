'use client';

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { HeroCard } from "@/components/ui/HeroCard";
import MetricCard from "@/components/dashboard/MetricCard";
import { ActionTile } from "@/components/ui/ActionTile";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { TrendingUp, Mail, BarChart3, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <Section title="Dashboard" description="Today's overview">
      <div className="space-y-8">
        {/* HERO */}
        <HeroCard
          title="Welcome to Hyper"
          actions={
            <>
              <Button>Start</Button>
              <Button variant="secondary">Configure</Button>
            </>
          }
        >
          Start your brand run to audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.
        </HeroCard>

        {/* KPIs */}
        <div>
          <h3 className="text-base font-semibold">Performance Overview</h3>
          <p className="text-[var(--muted)] text-sm">Your brand deals performance metrics</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Deals"
              value="24"
              delta={{ value: 12, isPositive: true }}
              icon={<TrendingUp />}
            />
            <MetricCard
              label="Active Outreach"
              value="8"
              delta={{ value: 3, isPositive: true }}
              icon={<Mail />}
            />
            <MetricCard
              label="Response Rate"
              value="68%"
              delta={{ value: 5, isPositive: false }}
              icon={<BarChart3 />}
            />
            <MetricCard
              label="Avg Deal Value"
              value="$2.4k"
              delta={{ value: 18, isPositive: true }}
              icon={<DollarSign />}
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <ActionTile icon={"🚀"} label="Start Brand Run" />
            <ActionTile icon={"🛠️"} label="Tools" />
            <ActionTile icon={"👥"} label="Manage Contacts" />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h3 className="text-base font-semibold">Recent Activity</h3>
          <div className="mt-4">
            <ActivityList
              items={[
                { id: 1, title: "Brand Run Started", timeAgo: "2 minutes ago" },
                { id: 2, title: "AI Audit Completed", timeAgo: "5 minutes ago" },
              ]}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
