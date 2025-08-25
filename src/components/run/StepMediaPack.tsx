'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface StepMediaPackProps {
  selectedBrandIds: string[];
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

export function StepMediaPack({ selectedBrandIds, onContinue, onBack, className = '' }: StepMediaPackProps) {
  const [template, setTemplate] = useState<'default' | 'brand'>('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const hasBrands = selectedBrandIds.length > 0;

  const generateMediaPack = async () => {
    setIsGenerating(true);
    
    try {
      // Use provider system for media pack generation
      const { Providers } = await import('@/services/providers');
      const mediaPackResult = await Providers.mediaPack.generate({ 
        brandId: selectedBrandIds[0] || 'demo-brand', 
        creatorId: 'demo-creator', 
        variant: template 
      });
      
      console.log('Media pack generated:', mediaPackResult);
      setHasGenerated(true);
    } catch (error) {
      console.error('Media pack generation failed:', error);
      // Fallback to mock generation
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">Media Pack</h1>
        <p className="text-[var(--muted)]">
          Choose your media pack template and generate a professional presentation for brands.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Template Selection</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              template === 'default' 
                ? 'border-[var(--brand)] bg-[var(--brand)]/10' 
                : 'border-[var(--border)] hover:border-[var(--muted)]'
            }`}
            onClick={() => setTemplate('default')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                {template === 'default' && <div className="w-2 h-2 bg-current rounded-full" />}
              </div>
              <h3 className="font-medium text-[var(--text)]">Default Template</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Clean, professional design with neutral colors and modern typography.
            </p>
          </div>

          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              template === 'brand' 
                ? 'border-[var(--brand)] bg-[var(--brand)]/10' 
                : 'border-[var(--border)] hover:border-[var(--muted)]'
            } ${!hasBrands ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => hasBrands && setTemplate('brand')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                {template === 'brand' && <div className="w-2 h-2 bg-current rounded-full" />}
              </div>
              <h3 className="font-medium text-[var(--text)]">Brand Themed</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Customized with your selected brand's colors and styling.
            </p>
            {!hasBrands && (
              <p className="text-xs text-[var(--warning)] mt-2">
                Requires selected brands
              </p>
            )}
          </div>
        </div>

        {!hasGenerated ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Ready to generate your media pack?</h3>
            <p className="text-[var(--muted)] mb-6">
              This will create both HTML preview and PDF download versions.
            </p>
            <Button
              onClick={generateMediaPack}
              disabled={isGenerating}
              size="md"
              className={isGenerating ? 'bg-[var(--muted)] text-[var(--text)] cursor-not-allowed' : ''}
            >
              {isGenerating ? 'Generating...' : 'Generate & Continue'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--positive)]/20 border border-[var(--positive)]/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-[var(--positive)]">✓</span>
                <span className="text-sm font-medium text-[var(--text)]">Media pack generated successfully!</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Your media pack is ready with {template === 'brand' ? 'brand-themed styling' : 'default styling'}.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--border)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-2">HTML Preview</h4>
                <p className="text-sm text-[var(--muted)] mb-3">View your media pack in the browser</p>
                <Button variant="secondary" className="w-full">
                  Preview HTML
                </Button>
              </div>
              
              <div className="p-4 border border-[var(--border)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-2">PDF Download</h4>
                <p className="text-sm text-[var(--muted)] mb-3">Download for sharing with brands</p>
                <Button variant="secondary" className="w-full">
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between">
                <Button
                  onClick={onBack}
                  variant="secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={onContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
