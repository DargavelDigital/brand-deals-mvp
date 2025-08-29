import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DealTracker } from '../src/components/deals/DealTracker';
import { DealsOverview } from '../src/components/deals/DealsOverview';

// Mock fetch globally
global.fetch = vi.fn();

describe('Epic 19.4: Deal Value Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DealTracker', () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Beauty Campaign',
        description: 'Instagram beauty campaign',
        offerAmount: 1000,
        counterAmount: 1500,
        finalAmount: 1400,
        status: 'WON' as const,
        category: 'Beauty',
        brand: { id: 'brand1', name: 'Beauty Brand' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Tech Review',
        description: 'YouTube tech review',
        offerAmount: 2000,
        counterAmount: undefined,
        finalAmount: undefined,
        status: 'OPEN' as const,
        category: 'Tech',
        brand: { id: 'brand2', name: 'Tech Company' },
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    const mockBrands = [
      { id: 'brand1', name: 'Beauty Brand' },
      { id: 'brand2', name: 'Tech Company' },
    ];

    it('renders deal tracker with table and log button', () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBrands,
        });

      render(<DealTracker />);
      
      expect(screen.getByText('Deal Value Tracker')).toBeInTheDocument();
      expect(screen.getByText('+ Log Deal')).toBeInTheDocument();
      expect(screen.getByText('Brand')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Initial Offer')).toBeInTheDocument();
      expect(screen.getByText('Counter')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
      expect(screen.getByText('Uplift')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays deals with correct uplift calculations', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBrands,
        });

      render(<DealTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('Beauty Brand')).toBeInTheDocument();
        expect(screen.getByText('Beauty Campaign')).toBeInTheDocument();
        expect(screen.getByText('$1,000')).toBeInTheDocument();
        expect(screen.getByText('$1,500')).toBeInTheDocument();
        expect(screen.getByText('$1,400')).toBeInTheDocument();
        expect(screen.getByText('+$400')).toBeInTheDocument();
        expect(screen.getByText('+40.0%')).toBeInTheDocument();
        expect(screen.getByText('Won')).toBeInTheDocument();
        expect(screen.getByText('Beauty')).toBeInTheDocument();
      });
    });

    it('shows log deal modal when button is clicked', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBrands,
        });

      render(<DealTracker />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('+ Log Deal'));
      });

      expect(screen.getByText('Log New Deal')).toBeInTheDocument();
      expect(screen.getByLabelText('Deal Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Brand *')).toBeInTheDocument();
      expect(screen.getByLabelText('Initial Offer Amount ($) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Counter Amount ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Final Amount ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Status *')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('allows editing existing deals', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBrands,
        });

      render(<DealTracker />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('Edit Deal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Beauty Campaign')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1400')).toBeInTheDocument();
    });

    it('submits new deal successfully', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBrands,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '3', ...mockDeals[0] }),
        });

      render(<DealTracker />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('+ Log Deal'));
      });

      // Fill form
      fireEvent.change(screen.getByLabelText('Deal Title *'), { target: { value: 'New Deal' } });
      fireEvent.change(screen.getByLabelText('Brand *'), { target: { value: 'brand1' } });
      fireEvent.change(screen.getByLabelText('Initial Offer Amount ($) *'), { target: { value: '3000' } });
      fireEvent.change(screen.getByLabelText('Status *'), { target: { value: 'OPEN' } });

      // Submit
      fireEvent.click(screen.getByText('Log Deal'));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/deals/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Deal',
            description: '',
            brandId: 'brand1',
            offerAmount: 3000,
            counterAmount: 0,
            finalAmount: 0,
            status: 'OPEN',
            category: '',
            dealId: undefined,
          }),
        });
      });
    });

    it('handles API errors gracefully', async () => {
      (fetch as any)
        .mockRejectedValueOnce(new Error('Network error'));

      render(<DealTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading deals...')).toBeInTheDocument();
      });
    });
  });

  describe('DealsOverview', () => {
    const mockAnalytics = {
      overview: {
        totalDeals: 10,
        wonDeals: 7,
        lostDeals: 2,
        counteredDeals: 3,
        winRate: 70,
      },
      financials: {
        avgOfferAmount: 1500,
        avgFinalAmount: 1800,
        avgUplift: 300,
        avgUpliftPct: 20,
        totalUplift: 2100,
      },
      categoryInsights: {
        Beauty: {
          count: 4,
          avgOffer: 1200,
          avgFinal: 1500,
          avgUpliftPct: 25,
        },
        Tech: {
          count: 6,
          avgOffer: 1700,
          avgFinal: 2000,
          avgUpliftPct: 17.6,
        },
      },
    };

    it('renders overview cards with correct metrics', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      render(<DealsOverview />);
      
      await waitFor(() => {
        expect(screen.getByText('Deals Overview')).toBeInTheDocument();
        expect(screen.getByText('+20.0%')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('$1,800')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('+$2,100')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('displays category insights table', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      render(<DealsOverview />);
      
      await waitFor(() => {
        expect(screen.getByText('Category Insights')).toBeInTheDocument();
        expect(screen.getByText('Beauty')).toBeInTheDocument();
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByText('$1,200')).toBeInTheDocument();
        expect(screen.getByText('$1,700')).toBeInTheDocument();
        expect(screen.getByText('$1,500')).toBeInTheDocument();
        expect(screen.getByText('$2,000')).toBeInTheDocument();
        expect(screen.getByText('+25.0%')).toBeInTheDocument();
        expect(screen.getByText('+17.6%')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<DealsOverview />);
      
      expect(screen.getAllByText('').length).toBeGreaterThan(0); // Loading skeleton
    });

    it('handles no data gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      render(<DealsOverview />);
      
      await waitFor(() => {
        expect(screen.getByText('No deal data available. Start logging deals to see insights.')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('API error'));

      render(<DealsOverview />);
      
      await waitFor(() => {
        expect(screen.getAllByText('').length).toBeGreaterThan(0); // Loading skeleton
      });
    });
  });

  describe('Integration Tests', () => {
    it('deal tracker and overview work together', async () => {
      const mockDeals = [
        {
          id: '1',
          title: 'Test Deal',
          offerAmount: 1000,
          finalAmount: 1200,
          status: 'WON' as const,
          category: 'Test',
          brand: { id: 'brand1', name: 'Test Brand' },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockAnalytics = {
        overview: { totalDeals: 1, wonDeals: 1, lostDeals: 0, counteredDeals: 0, winRate: 100 },
        financials: { avgOfferAmount: 1000, avgFinalAmount: 1200, avgUplift: 200, avgUpliftPct: 20, totalUplift: 200 },
        categoryInsights: {
          Test: { count: 1, avgOffer: 1000, avgFinal: 1200, avgUpliftPct: 20 },
        },
      };

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeals,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'brand1', name: 'Test Brand' }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnalytics,
        });

      // Test that both components can fetch and display data
      const { rerender } = render(<DealTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Deal')).toBeInTheDocument();
        expect(screen.getByText('+$200')).toBeInTheDocument();
        expect(screen.getByText('+20.0%')).toBeInTheDocument();
      });

      rerender(<DealsOverview />);
      
      await waitFor(() => {
        expect(screen.getByText('+20.0%')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('$1,200')).toBeInTheDocument();
      });
    });
  });
});
