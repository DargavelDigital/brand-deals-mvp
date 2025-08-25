import Button from '@/components/ui/Button';

export default function BillingPage() {
  return (
    <div>
      <div>
        <h1>Billing & Plans</h1>
        <p>
          Manage your subscription and billing information.
        </p>
      </div>

      <div>
        <h2>Current Plan</h2>
        <div>
          <div>
            <div>
              <h3>Pro Plan</h3>
              <p>$29/month</p>
            </div>
            <span>
              Active
            </span>
          </div>
        </div>

        <div>
          <div>
            <div>
              <span>Next billing date</span>
              <span>December 15, 2024</span>
            </div>
            <div>
              <span>Payment method</span>
              <span>•••• •••• •••• 4242</span>
            </div>
          </div>
        </div>

        <div>
          <Button>
            Upgrade Plan
          </Button>
          <Button>
            Manage Billing
          </Button>
        </div>
      </div>
    </div>
  );
}
