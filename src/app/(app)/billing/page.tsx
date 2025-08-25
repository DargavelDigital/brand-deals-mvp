import Button from '@/components/ui/Button';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Billing & Plans</h1>
        <p className="text-[var(--muted)]">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Current Plan</h2>
        
        <div className="bg-[var(--panel)] border border-[var(--border)] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Pro Plan</h3>
              <p className="text-[var(--muted)]">$29/month</p>
            </div>
            <span className="px-3 py-1 bg-[var(--positive)]/20 text-[var(--positive)] text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--text)]">Next billing date</span>
            <span className="text-[var(--muted)]">December 15, 2024</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--text)]">Payment method</span>
            <span className="text-[var(--muted)]">•••• •••• •••• 4242</span>
          </div>
        </div>
        
        <div className="mt-6 space-x-3">
          <Button>
            Change Plan
          </Button>
          <Button variant="secondary">
            Update Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}
