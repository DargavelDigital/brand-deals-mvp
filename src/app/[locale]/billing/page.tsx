import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    features: ["5 brand audits", "10 media packs", "Basic outreach", "Email support"],
    popular: false
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    features: ["25 brand audits", "50 media packs", "Advanced outreach", "Priority support", "Analytics"],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    features: ["Unlimited audits", "Unlimited packs", "Full automation", "Dedicated support", "Custom integrations"],
    popular: false
  }
];

export default function BillingPage() {
  return (
    <Section title="Billing" description="Plan & invoices">
      <div className="space-y-8">
        {/* Plans grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`p-6 ${plan.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
                {plan.popular && (
                  <div className="text-xs font-medium text-[color:var(--accent)] mb-2">Most Popular</div>
                )}
                <div className="text-xl font-bold">{plan.name}</div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-[var(--muted)]">{plan.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-[var(--muted)] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-4 w-full">
                  Choose {plan.name}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment method and invoices */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-md">
                <div className="w-8 h-8 bg-[color:var(--accent)]/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[color:var(--accent)]">💳</span>
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-[var(--muted)]">Expires 12/25</div>
                </div>
              </div>
              <Button variant="secondary">Update Payment Method</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md">
                <div>
                  <div className="font-medium">January 2024</div>
                  <div className="text-sm text-[var(--muted)]">Professional Plan</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">$99.00</div>
                  <div className="text-sm text-success">Paid</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md">
                <div>
                  <div className="font-medium">December 2023</div>
                  <div className="text-sm text-[var(--muted)]">Professional Plan</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">$99.00</div>
                  <div className="text-sm text-success">Paid</div>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="mt-3 w-full">View All Invoices</Button>
          </Card>
        </div>
      </div>
    </Section>
  );
}
