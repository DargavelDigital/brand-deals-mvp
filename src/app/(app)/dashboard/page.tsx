'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { HeroCard } from "@/components/ui/HeroCard";
import MetricCard from "@/components/dashboard/MetricCard";
import ActionTile from "@/components/ui/ActionTile";
import ActivityList from "@/components/dashboard/ActivityList";
import { useDashboard } from "@/hooks/useDashboard";
import { useBrandRun } from "@/hooks/useBrandRun";
import OneTouchSheet from "@/components/run/OneTouchSheet";

export default function DashboardPage() {
  const router = useRouter();
  const { summary, isLoading } = useDashboard();
  const { status, isLoading: loadingStatus } = useBrandRun();
  const [brandRunStatus, setBrandRunStatus] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Check if brand run is in progress
  useEffect(() => {
    const checkBrandRun = async () => {
      try {
        const response = await fetch('/api/brand-run/current');
        if (response.ok) {
          const data = await response.json();
          setBrandRunStatus(data.status || 'idle');
        }
      } catch (error) {
        console.log('Brand run check failed, using default status');
      }
    };
    
    checkBrandRun();
  }, []);

  const onStart = async () => {
    console.log('onStart clicked');
    try {
      setBusy(true);
      const r = await fetch('/api/brand-run/start', { method: 'POST' });
      const j = await r.json().catch(() => ({}));
      if (j?.ok && j?.redirect) { 
        router.push(j.redirect); 
        return; 
      }
      // fallback: go to the workflow regardless
      router.push('/brand-run');
    } catch (e) {
      // optionally toast; stay quiet to avoid copy changes
      router.push('/brand-run');
    } finally { 
      setBusy(false); 
    }
  };

  const onConfigure = () => {
    console.log('onConfigure clicked');
    router.push('/settings');
  };

  const label = (status && status !== 'idle') ? 'Continue' : 'Start';

  // Default values for fallback
  const defaultSummary = {
    totalDeals: 24,
    activeOutreach: 8,
    responseRate: 0.68,
    avgDealValue: 2400,
    deltas: { deals: 0.12, outreach: 0.03, response: -0.05, adv: 0.18 }
  };

  const data = summary || defaultSummary;

  return (
    <Section title="Dashboard" description="Today's overview">
      <div className="space-y-8">
        {/* HERO */}
        <HeroCard title="Welcome to Hyper" actions={
          <>
            <Button onClick={onStart} disabled={busy || loadingStatus}>
              {label}
            </Button>
            <Button variant="secondary" onClick={onConfigure}>
              Configure
            </Button>
          </>
        }>
          Start your brand run to audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.
        </HeroCard>

        {/* ONE-TOUCH BRAND RUN CTA */}
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Quick Start</h3>
            <p className="text-[var(--muted)] text-sm">Automate your entire brand discovery and outreach process</p>
          </div>
          <Button onClick={() => setSheetOpen(true)}>
            One-Touch Brand Run
          </Button>
        </div>

        {/* KPIs */}
        <div>
          <h3 className="text-base font-semibold">Performance Overview</h3>
          <p className="text-[var(--muted)] text-sm">Your brand deals performance metrics</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              label="Total Deals" 
              value={isLoading ? "..." : data.totalDeals.toString()} 
              delta={{ value: data.deltas.deals * 100, isPositive: data.deltas.deals > 0 }} 
              icon={"↗"} 
            />
            <MetricCard 
              label="Active Outreach" 
              value={isLoading ? "..." : data.activeOutreach.toString()} 
              delta={{ value: data.deltas.outreach * 100, isPositive: data.deltas.outreach > 0 }} 
              icon={"✉️"} 
            />
            <MetricCard 
              label="Response Rate" 
              value={isLoading ? "..." : `${Math.round(data.responseRate * 100)}%`} 
              delta={{ value: data.deltas.response * 100, isPositive: data.deltas.response > 0 }} 
              icon={"📊"} 
            />
            <MetricCard 
              label="Avg Deal Value" 
              value={isLoading ? "..." : `$${(data.avgDealValue / 1000).toFixed(1)}k`} 
              delta={{ value: data.deltas.adv * 100, isPositive: data.deltas.adv > 0 }} 
              icon={"💵"} 
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <ActionTile 
              icon={"🚀"} 
              label={brandRunStatus !== 'idle' ? "Continue Brand Run" : "Start Brand Run"} 
              href="/brand-run" 
            />
            <ActionTile icon={"🛠️"} label="Tools" href="/tools" />
            <ActionTile icon={"👥"} label="Manage Contacts" href="/contacts" />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h3 className="text-base font-semibold">Recent Activity</h3>
          <div className="mt-4">
            <ActivityList />
          </div>
        </div>
      </div>

      {/* One-Touch Sheet */}
      <OneTouchSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Section>
  );
}
