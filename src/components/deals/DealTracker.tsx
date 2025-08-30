'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Deal {
  id: string;
  title: string;
  description?: string;
  offerAmount: number;
  counterAmount?: number;
  finalAmount?: number;
  status: 'OPEN' | 'COUNTERED' | 'WON' | 'LOST';
  category?: string;
  brand: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DealFormData {
  title: string;
  description: string;
  brandId: string;
  offerAmount: number;
  counterAmount: number;
  finalAmount: number;
  status: 'OPEN' | 'COUNTERED' | 'WON' | 'LOST';
  category: string;
}

const DEAL_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'COUNTERED', label: 'Countered' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const CATEGORIES = [
  'Beauty',
  'Fashion',
  'Gaming',
  'Tech',
  'Fitness',
  'Food',
  'Travel',
  'Finance',
  'Education',
  'Entertainment',
];

export function DealTracker() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    description: '',
    brandId: '',
    offerAmount: 0,
    counterAmount: 0,
    finalAmount: 0,
    status: 'OPEN',
    category: '',
  });

  useEffect(() => {
    fetchDeals();
    fetchBrands();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals/log');
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      // Failed to fetch deals
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      // Failed to fetch brands
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        dealId: editingDeal?.id,
        offerAmount: Number(formData.offerAmount),
        counterAmount: formData.counterAmount > 0 ? Number(formData.counterAmount) : undefined,
        finalAmount: formData.finalAmount > 0 ? Number(formData.finalAmount) : undefined,
      };

      const response = await fetch('/api/deals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchDeals();
        handleCloseModal();
      }
    } catch (error) {
      // Failed to save deal
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      brandId: deal.brand.id,
      offerAmount: deal.offerAmount,
      counterAmount: deal.counterAmount || 0,
      finalAmount: deal.finalAmount || 0,
      status: deal.status,
      category: deal.category || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      brandId: '',
      offerAmount: 0,
      counterAmount: 0,
      finalAmount: 0,
      status: 'OPEN',
      category: '',
    });
  };

  const calculateUplift = (offer: number, final?: number) => {
    if (!final) return null;
    const uplift = final - offer;
    const upliftPct = (uplift / offer) * 100;
    return { amount: uplift, percentage: upliftPct };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'text-green-600 bg-green-100';
      case 'LOST': return 'text-red-600 bg-red-100';
      case 'COUNTERED': return 'text-blue-600 bg-blue-100';
      case 'OPEN': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading deals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Deal Value Tracker</h2>
        <Button onClick={() => setShowModal(true)}>
          + Log Deal
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium">Brand</th>
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Initial Offer</th>
                <th className="text-left py-3 px-4 font-medium">Counter</th>
                <th className="text-left py-3 px-4 font-medium">Final</th>
                <th className="text-left py-3 px-4 font-medium">Uplift</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const uplift = calculateUplift(deal.offerAmount, deal.finalAmount);
                return (
                  <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{deal.brand.name}</td>
                    <td className="py-3 px-4 font-medium">{deal.title}</td>
                    <td className="py-3 px-4">${deal.offerAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {deal.counterAmount ? `$${deal.counterAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {deal.finalAmount ? `$${deal.finalAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {uplift ? (
                        <div>
                          <div className="font-medium text-green-600">
                            +${uplift.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            +{uplift.percentage.toFixed(1)}%
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {deal.category || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(deal)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {deals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No deals logged yet. Click "+ Log Deal" to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingDeal ? 'Edit Deal' : 'Log New Deal'}
              </h3>
              <Button variant="outline" onClick={handleCloseModal}>
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Deal Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="brandId" className="block text-sm font-medium mb-2">
                    Brand *
                  </label>
                  <Select
                    id="brandId"
                    value={formData.brandId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="offerAmount" className="block text-sm font-medium mb-2">
                    Initial Offer Amount ($) *
                  </label>
                  <Input
                    id="offerAmount"
                    type="number"
                    value={formData.offerAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerAmount: Number(e.target.value) }))}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="counterAmount" className="block text-sm font-medium mb-2">
                    Counter Amount ($)
                  </label>
                  <Input
                    id="counterAmount"
                    type="number"
                    value={formData.counterAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, counterAmount: Number(e.target.value) }))}
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="finalAmount" className="block text-sm font-medium mb-2">
                    Final Amount ($)
                  </label>
                  <Input
                    id="finalAmount"
                    type="number"
                    value={formData.finalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, finalAmount: Number(e.target.value) }))}
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2">
                    Status *
                  </label>
                  <Select
                    id="status"
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    required
                  >
                    {DEAL_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select
                    id="category"
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDeal ? 'Update Deal' : 'Log Deal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
