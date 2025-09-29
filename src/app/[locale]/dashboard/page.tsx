'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { HeroCard } from "@/components/ui/HeroCard";
import MetricCard from "@/components/dashboard/MetricCard";
import ActionTile from "@/components/ui/ActionTile";
import ActivityList from "@/components/dashboard/ActivityList";
import { useDashboard } from "@/hooks/useDashboard";
import { useBrandRun } from "@/hooks/useBrandRun";
import OneTouchSheet from "@/components/run/OneTouchSheet";
import { safeJson } from '@/lib/http/safeJson'
import { FeedbackSummaryWidget } from "@/components/feedback/FeedbackSummaryWidget";
import { useInstagramStatus } from "@/hooks/useInstagramStatus";
import InstagramOverview from "@/components/instagram/InstagramOverview";
import InstagramMediaTable from "@/components/instagram/InstagramMediaTable";

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { summary, isLoading } = useDashboard();
  const { status, isLoading: loadingStatus } = useBrandRun();
  const { status: instagramStatus, isLoading: instagramLoading } = useInstagramStatus();
  const [brandRunStatus, setBrandRunStatus] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Check if brand run is in progress
  useEffect(() => {
    const checkBrandRun = async () => {
      try {
              const { ok, status, body } = await safeJson('/api/brand-run/current');
      if (ok && body?.data?.step) {
        setBrandRunStatus(body.data.step || 'idle');
      }
      } catch (error) {
        // Brand run check failed, using default status
      }
    };
    
    checkBrandRun();
  }, []);

  const onStart = async () => {
    try {
      setBusy(true);
      const { ok, status, body } = await safeJson('/api/brand-run/start', { method: 'POST' });
      if (ok && body?.redirect) { 
        router.push(body.redirect); 
        return; 
      }
      // fallback: go to the workflow regardless
      router.push(`/${locale}/brand-run`);
    } catch (e) {
      // optionally toast; stay quiet to avoid copy changes
      router.push(`/${locale}/brand-run`);
    } finally { 
      setBusy(false); 
    }
  };

  const onConfigure = () => {
    router.push(`/${locale}/settings`);
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
    <Section title={t('nav.dashboard')} description={t('dashboard.overview')}>
      <div className="space-y-8">
        {/* HERO */}
        <HeroCard title={t('dashboard.welcome')} actions={
          <>
            <Button onClick={onStart} disabled={busy || loadingStatus}>
              {label === 'Start' ? t('dashboard.start') : t('dashboard.continue')}
            </Button>
            <Button variant="secondary" onClick={onConfigure}>
              {t('dashboard.configure')}
            </Button>
          </>
        }>
          {t('dashboard.description')}
        </HeroCard>

        {/* ONE-TOUCH BRAND RUN CTA */}
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">{t('dashboard.quickStart')}</h3>
            <p className="text-[var(--muted)] text-sm">{t('dashboard.quickStartDesc')}</p>
          </div>
          <Button data-testid="one-touch-btn" onClick={() => setSheetOpen(true)}>
            {t('cta.oneTouch')}
          </Button>
        </div>

        {/* KPIs */}
        <div>
          <h3 className="text-base font-semibold">{t('dashboard.performanceOverview')}</h3>
          <p className="text-[var(--muted)] text-sm">{t('dashboard.performanceDesc')}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              label={t('dashboard.totalDeals')} 
              value={isLoading ? "..." : data.totalDeals.toString()} 
              delta={{ value: data.deltas.deals * 100, isPositive: data.deltas.deals > 0 }} 
              icon={"↗"} 
            />
            <MetricCard 
              label={t('dashboard.activeOutreach')} 
              value={isLoading ? "..." : data.activeOutreach.toString()} 
              delta={{ value: data.deltas.outreach * 100, isPositive: data.deltas.outreach > 0 }} 
              icon={"✉️"} 
            />
            <MetricCard 
              label={t('dashboard.responseRate')} 
              value={isLoading ? "..." : `${Math.round(data.responseRate * 100)}%`} 
              delta={{ value: data.deltas.response * 100, isPositive: data.deltas.response > 0 }} 
              icon={"📊"} 
            />
            <MetricCard 
              label={t('dashboard.avgDealValue')} 
              value={isLoading ? "..." : `$${(data.avgDealValue / 1000).toFixed(1)}k`} 
              delta={{ value: data.deltas.adv * 100, isPositive: data.deltas.adv > 0 }} 
              icon={"💵"} 
            />
          </div>
        </div>

        {/* AI FEEDBACK SUMMARY */}
        <div>
          <h3 className="text-base font-semibold">AI Quality & Feedback</h3>
          <p className="text-[var(--muted)] text-sm">Monitor how users rate AI-generated content</p>
          <div className="mt-4">
            <FeedbackSummaryWidget />
          </div>
        </div>

        {/* INSTAGRAM ANALYTICS */}
        {!instagramLoading && instagramStatus?.configured && (
          <div>
            <h3 className="text-base font-semibold">Instagram Analytics</h3>
            <p className="text-[var(--muted)] text-sm">
              {instagramStatus.connected 
                ? "Monitor your Instagram performance and engagement" 
                : "Connect your Instagram account to view analytics and insights"
              }
            </p>
            <div className="mt-4 space-y-6">
              <InstagramOverview />
              {instagramStatus.connected && <InstagramMediaTable />}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div>
          <h3 className="text-base font-semibold">{t('dashboard.quickActions')}</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <ActionTile 
              icon={"🚀"} 
              label={brandRunStatus !== 'idle' ? t('dashboard.continueBrandRun') : t('dashboard.startBrandRun')} 
              href={`/${locale}/brand-run`} 
            />
            <ActionTile icon={"🛠️"} label={t('dashboard.tools')} href={`/${locale}/tools`} />
            <ActionTile icon={"👥"} label={t('dashboard.manageContacts')} href={`/${locale}/contacts`} />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h3 className="text-base font-semibold">{t('dashboard.recentActivity')}</h3>
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
