import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function BillingPage() {
  return (
    <Section title="Billing" description="Manage your subscription and payment methods">
      <div className="space-y-6">
        {/* Plans/Pricing */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Starter</h3>
            <div className="text-3xl font-bold mb-4">$29<span className="text-lg text-[var(--muted)]">/month</span></div>
            <ul className="text-sm text-[var(--muted)] space-y-2 mb-6">
              <li>• 100 Audit Credits</li>
              <li>• 10 Media Packs</li>
              <li>• Basic Support</li>
            </ul>
            <Button className="mt-4 w-full">Choose</Button>
          </Card>
          
          <Card className="p-6 border-2 border-[color:var(--accent)]">
            <h3 className="font-bold text-lg mb-2">Professional</h3>
            <div className="text-3xl font-bold mb-4">$99<span className="text-lg text-[var(--muted)]">/month</span></div>
            <ul className="text-sm text-[var(--muted)] space-y-2 mb-6">
              <li>• 500 Audit Credits</li>
              <li>• 50 Media Packs</li>
              <li>• Priority Support</li>
              <li>• Advanced Analytics</li>
            </ul>
            <Button className="mt-4 w-full">Choose</Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">$299<span className="text-lg text-[var(--muted)]">/month</span></div>
            <ul className="text-sm text-[var(--muted)] space-y-2 mb-6">
              <li>• Unlimited Credits</li>
              <li>• Unlimited Media Packs</li>
              <li>• 24/7 Support</li>
              <li>• Custom Integrations</li>
            </ul>
            <Button className="mt-4 w-full">Choose</Button>
          </Card>
        </div>

        {/* Payment Method */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div className="flex items-center gap-3 p-4 bg-[color:var(--surface)] rounded-md">
            <div className="w-8 h-8 bg-[color:var(--accent)] rounded flex items-center justify-center text-white text-sm">💳</div>
            <div>
              <div className="font-medium">•••• •••• •••• 4242</div>
              <div className="text-sm text-[var(--muted)]">Expires 12/25</div>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
          </div>
        </Card>

        {/* Invoices */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[color:var(--surface)] rounded-md">
              <div>
                <div className="font-medium">January 2024</div>
                <div className="text-sm text-[var(--muted)]">Professional Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$99.00</div>
                <div className="text-sm text-[var(--muted)]">Paid</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[color:var(--surface)] rounded-md">
              <div>
                <div className="font-medium">December 2023</div>
                <div className="text-sm text-[var(--muted)]">Professional Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$99.00</div>
                <div className="text-sm text-[var(--muted)]">Paid</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
