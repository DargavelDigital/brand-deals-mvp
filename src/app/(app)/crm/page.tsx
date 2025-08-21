'use client';

import { DashboardGrid, Col } from '@/ui/containers';
import { DealCard } from '@/components/crm/DealCard';

export default function CRMPage() {
  // Mock data for demonstration
  const mockDeals = [
    {
      id: '1',
      title: 'Summer Campaign Partnership',
      value: 5000,
      status: 'ACTIVE',
      lastActivity: new Date('2024-01-15T10:30:00Z'),
      brand: {
        id: '1',
        name: 'Nike',
        logoUrl: 'https://logo.clearbit.com/nike.com'
      }
    },
    {
      id: '2',
      title: 'Product Launch Collaboration',
      value: 8000,
      status: 'PENDING',
      lastActivity: new Date('2024-01-14T15:45:00Z'),
      brand: {
        id: '2',
        name: 'Apple',
        logoUrl: 'https://logo.clearbit.com/apple.com'
      }
    },
    {
      id: '3',
      title: 'Holiday Season Promotion',
      value: 3500,
      status: 'COMPLETED',
      lastActivity: new Date('2024-01-10T09:15:00Z'),
      brand: {
        id: '3',
        name: 'Starbucks',
        logoUrl: 'https://logo.clearbit.com/starbucks.com'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[var(--positive)] text-white';
      case 'pending': return 'bg-[var(--warning)] text-white';
      case 'completed': return 'bg-[var(--muted)] text-[var(--text)]';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">CRM Pipeline</h1>
        <p className="text-[var(--muted)]">Manage your brand partnership deals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Pending</h2>
          <div className="space-y-3">
            {mockDeals.filter(deal => deal.status === 'pending').map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={deal.brand}
                onClick={() => console.log('View deal:', deal.title)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Active</h2>
          <div className="space-y-3">
            {mockDeals.filter(deal => deal.status === 'active').map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={deal.brand}
                onClick={() => console.log('View deal:', deal.title)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Completed</h2>
          <div className="space-y-3">
            {mockDeals.filter(deal => deal.status === 'completed').map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={deal.brand}
                onClick={() => console.log('View deal:', deal.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
