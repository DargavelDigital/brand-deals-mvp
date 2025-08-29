import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DealCalculator } from '../src/components/deals/DealCalculator';
import { CounterOfferGenerator } from '../src/components/deals/CounterOfferGenerator';
import { DealRedline } from '../src/components/deals/DealRedline';

// Mock fetch globally
global.fetch = vi.fn();

describe('Epic 19: Deal Desk & Pricing Assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DealCalculator', () => {
    it('renders calculator form with all inputs', () => {
      render(<DealCalculator />);
      
      expect(screen.getByText('Deal Pricing Calculator')).toBeInTheDocument();
      expect(screen.getByLabelText('Audience Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Engagement Rate (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Industry')).toBeInTheDocument();
      expect(screen.getByLabelText('Region')).toBeInTheDocument();
      expect(screen.getByText('Calculate Pricing')).toBeInTheDocument();
    });

    it('pre-fills with default values', () => {
      render(<DealCalculator defaultAudienceSize={25000} defaultEngagementRate={4.2} />);
      
      const audienceInput = screen.getByLabelText('Audience Size') as HTMLInputElement;
      const engagementInput = screen.getByLabelText('Engagement Rate (%)') as HTMLInputElement;
      
      expect(audienceInput.value).toBe('25000');
      expect(engagementInput.value).toBe('4.2');
    });

    it('calculates pricing when form is submitted', async () => {
      const mockResponse = {
        cpmLow: 8.0,
        cpmHigh: 12.0,
        cpaEstimate: 0.42,
        flatFeeRange: [140, 260]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DealCalculator />);
      
      fireEvent.click(screen.getByText('Calculate Pricing'));
      
      await waitFor(() => {
        expect(screen.getByText('$8.0 - $12.0')).toBeInTheDocument();
        expect(screen.getByText('$0.42')).toBeInTheDocument();
        expect(screen.getByText('$140 - $260')).toBeInTheDocument();
      });
    });

    it('handles calculation errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      render(<DealCalculator />);
      
      fireEvent.click(screen.getByText('Calculate Pricing'));
      
      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      });
    });
  });

  describe('CounterOfferGenerator', () => {
    const defaultProps = {
      audienceSize: 15000,
      engagementRate: 3.8,
      suggestedCpm: 11,
      suggestedFlatFee: 165
    };

    it('renders counter-offer form', () => {
      render(<CounterOfferGenerator {...defaultProps} />);
      
      expect(screen.getByText('Generate Counter-Offer')).toBeInTheDocument();
      expect(screen.getByLabelText("Brand's Offer Amount ($)")).toBeInTheDocument();
      expect(screen.getByLabelText('Deliverables *')).toBeInTheDocument();
      expect(screen.getByLabelText('Content Format')).toBeInTheDocument();
      expect(screen.getByLabelText('Timeline')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Tone')).toBeInTheDocument();
      expect(screen.getByLabelText('Additional Value')).toBeInTheDocument();
    });

    it('validates required fields before submission', async () => {
      render(<CounterOfferGenerator {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Generate Counter-Offer'));
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });

    it('generates counter-offer successfully', async () => {
      const mockResponse = {
        counterAmount: 1200,
        reasoning: 'Based on audience size and engagement rate',
        draftEmail: 'Hi Brand,\n\nThank you for the opportunity...',
        negotiationTips: ['Be confident in your value', 'Highlight your unique audience']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<CounterOfferGenerator {...defaultProps} />);
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText("Brand's Offer Amount ($)"), { target: { value: '800' } });
      fireEvent.change(screen.getByLabelText('Deliverables *'), { target: { value: 'One Instagram post' } });
      
      fireEvent.click(screen.getByText('Generate Counter-Offer'));
      
      await waitFor(() => {
        expect(screen.getByText('Suggested Counter: $1200')).toBeInTheDocument();
        expect(screen.getByText('Based on audience size and engagement rate')).toBeInTheDocument();
        expect(screen.getByText('Hi Brand,')).toBeInTheDocument();
        expect(screen.getByText('Be confident in your value')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid request' })
      });

      render(<CounterOfferGenerator {...defaultProps} />);
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText("Brand's Offer Amount ($)"), { target: { value: '800' } });
      fireEvent.change(screen.getByLabelText('Deliverables *'), { target: { value: 'One Instagram post' } });
      
      fireEvent.click(screen.getByText('Generate Counter-Offer'));
      
      await waitFor(() => {
        expect(screen.getByText('Invalid request')).toBeInTheDocument();
      });
    });
  });

  describe('DealRedline', () => {
    it('renders redline analysis form', () => {
      render(<DealRedline />);
      
      expect(screen.getByText('SOW Redline Helper')).toBeInTheDocument();
      expect(screen.getByLabelText('Creator Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Industry (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('SOW Text *')).toBeInTheDocument();
      expect(screen.getByText('Analyze SOW')).toBeInTheDocument();
    });

    it('validates SOW text before analysis', async () => {
      render(<DealRedline />);
      
      fireEvent.click(screen.getByText('Analyze SOW'));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter SOW text to analyze')).toBeInTheDocument();
      });
    });

    it('analyzes SOW successfully', async () => {
      const mockResponse = {
        summary: 'This SOW contains several high-risk clauses',
        risks: [
          {
            clause: 'Creator agrees to 24-month exclusivity',
            issue: 'Exclusivity period is too long',
            riskLevel: 'High' as const,
            suggestion: 'Limit to 3-6 months',
            category: 'exclusivity'
          }
        ],
        recommendations: ['Negotiate shorter exclusivity period'],
        overallRisk: 'High' as const
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DealRedline />);
      
      // Fill SOW text
      const textarea = screen.getByLabelText('SOW Text *');
      fireEvent.change(textarea, { target: { value: 'Creator agrees to 24-month exclusivity' } });
      
      fireEvent.click(screen.getByText('Analyze SOW'));
      
      await waitFor(() => {
        expect(screen.getByText('This SOW contains several high-risk clauses')).toBeInTheDocument();
        expect(screen.getByText('High Risk')).toBeInTheDocument();
        expect(screen.getByText('Creator agrees to 24-month exclusivity')).toBeInTheDocument();
        expect(screen.getByText('Exclusivity period is too long')).toBeInTheDocument();
        expect(screen.getByText('Limit to 3-6 months')).toBeInTheDocument();
      });
    });

    it('handles analysis errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Analysis failed'));
      
      render(<DealRedline />);
      
      // Fill SOW text
      const textarea = screen.getByLabelText('SOW Text *');
      fireEvent.change(textarea, { target: { value: 'Sample SOW text' } });
      
      fireEvent.click(screen.getByText('Analyze SOW'));
      
      await waitFor(() => {
        expect(screen.getByText('Analysis failed')).toBeInTheDocument();
      });
    });

    it('provides risk level color coding', async () => {
      const mockResponse = {
        summary: 'Mixed risk levels',
        risks: [
          {
            clause: 'Low risk clause',
            issue: 'Minor concern',
            riskLevel: 'Low' as const,
            suggestion: 'Monitor',
            category: 'other'
          },
          {
            clause: 'Critical risk clause',
            issue: 'Major problem',
            riskLevel: 'Critical' as const,
            suggestion: 'Immediate action required',
            category: 'exclusivity'
          }
        ],
        recommendations: ['Address critical issues first'],
        overallRisk: 'Critical' as const
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DealRedline />);
      
      // Fill SOW text
      const textarea = screen.getByLabelText('SOW Text *');
      fireEvent.change(textarea, { target: { value: 'Sample SOW text' } });
      
      fireEvent.click(screen.getByText('Analyze SOW'));
      
      await waitFor(() => {
        const lowRisk = screen.getByText('Low Risk');
        const criticalRisk = screen.getByText('Critical Risk');
        
        expect(lowRisk).toBeInTheDocument();
        expect(criticalRisk).toBeInTheDocument();
        
        // Check that they have different styling classes
        expect(lowRisk.className).toContain('text-green-600');
        expect(criticalRisk.className).toContain('text-red-600');
      });
    });
  });

  describe('Integration Tests', () => {
    it('components work together in a workflow', async () => {
      // Mock successful responses for all components
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            cpmLow: 10.0,
            cpmHigh: 15.0,
            cpaEstimate: 0.5,
            flatFeeRange: [200, 400]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            counterAmount: 1500,
            reasoning: 'Based on calculated rates',
            draftEmail: 'Professional counter-offer email',
            negotiationTips: ['Be confident', 'Use data']
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            summary: 'Low risk SOW',
            risks: [],
            recommendations: ['Proceed with confidence'],
            overallRisk: 'Low'
          })
        });

      // Test that all components can be used in sequence
      const { rerender } = render(<DealCalculator />);
      
      // First, calculate pricing
      fireEvent.click(screen.getByText('Calculate Pricing'));
      
      await waitFor(() => {
        expect(screen.getByText('$10.0 - $15.0')).toBeInTheDocument();
      });

      // Then test counter-offer generation
      rerender(
        <CounterOfferGenerator 
          audienceSize={10000}
          engagementRate={3.5}
          suggestedCpm={12.5}
          suggestedFlatFee={300}
        />
      );

      fireEvent.change(screen.getByLabelText("Brand's Offer Amount ($)"), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText('Deliverables *'), { target: { value: 'One post' } });
      fireEvent.click(screen.getByText('Generate Counter-Offer'));

      await waitFor(() => {
        expect(screen.getByText('Suggested Counter: $1500')).toBeInTheDocument();
      });

      // Finally test SOW analysis
      rerender(<DealRedline />);
      
      const textarea = screen.getByLabelText('SOW Text *');
      fireEvent.change(textarea, { target: { value: 'Sample SOW text' } });
      fireEvent.click(screen.getByText('Analyze SOW'));

      await waitFor(() => {
        expect(screen.getByText('Low risk SOW')).toBeInTheDocument();
      });
    });
  });
});
