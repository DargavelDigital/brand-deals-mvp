import { DashboardGrid, Col } from '@/ui/containers';
import { MetricCard } from '@/components/dashboard/MetricCard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero CTA Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-4">Start a Brand Run</h1>
          <p className="text-lg text-[var(--muted)] mb-6">
            We'll audit your content, pick brands, build your media pack, find contacts, and send the outreach automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/brand-run" 
              className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Start Brand Run
            </a>
            <button className="px-6 py-3 text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]">
              Configure
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Performance Overview</h2>
        <p className="text-[var(--muted)]">Your brand deals performance metrics</p>
      </div>

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
