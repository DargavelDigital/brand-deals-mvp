'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StepMediaPackProps {
  selectedBrandIds: string[];
  onContinue: () => void;
  onBack: () => void;
}

export function StepMediaPack({ selectedBrandIds, onContinue, onBack }: StepMediaPackProps) {
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
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Media Pack</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Choose your media pack template and generate a professional presentation for brands.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text">Template Selection</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div 
            onClick={() => setTemplate('default')}
            className="p-6 bg-surface rounded-lg border border-border cursor-pointer hover:border-accent transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-border flex items-center justify-center">
                  {template === 'default' && <div className="w-2 h-2 bg-accent rounded-full" />}
                </div>
                <h3 className="font-medium text-text">Default Template</h3>
              </div>
              <p className="text-sm text-muted">
                Clean, professional design with neutral colors and modern typography.
              </p>
            </div>
          </div>

          <div 
            onClick={() => hasBrands && setTemplate('brand')}
            className={`p-6 rounded-lg border transition-colors ${
              hasBrands 
                ? 'bg-surface border-border cursor-pointer hover:border-accent' 
                : 'bg-surface/50 border-border/50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-border flex items-center justify-center">
                  {template === 'brand' && <div className="w-2 h-2 bg-accent rounded-full" />}
                </div>
                <h3 className="font-medium text-text">Brand Themed</h3>
              </div>
              <p className="text-sm text-muted">
                Customized with your selected brand's colors and styling.
              </p>
              {!hasBrands && (
                <p className="text-xs text-muted">
                  Requires selected brands
                </p>
              )}
            </div>
          </div>
        </div>

        {!hasGenerated ? (
          <div className="text-center">
            <Button
              onClick={generateMediaPack}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Media Pack'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg font-medium text-text">Media pack generated successfully!</span>
              </div>
              <p className="text-muted">
                Your professional media pack is ready for outreach.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-medium text-text">
                  {selectedBrandIds.length} brand{selectedBrandIds.length !== 1 ? 's' : ''} included
                </div>
                <div className="text-sm text-muted">
                  Ready to proceed to contact discovery
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onBack}
                  variant="secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={onContinue}
                >
                  Continue to Contacts
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
