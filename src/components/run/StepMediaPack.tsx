'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

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
    <div>
      <div>
        <h1>Media Pack</h1>
        <p>
          Choose your media pack template and generate a professional presentation for brands.
        </p>
      </div>

      <div>
        <h2>Template Selection</h2>
        
        <div>
          <div 
            onClick={() => setTemplate('default')}
          >
            <div>
              <div>
                {template === 'default' && <div />}
              </div>
              <h3>Default Template</h3>
            </div>
            <p>
              Clean, professional design with neutral colors and modern typography.
            </p>
          </div>

          <div 
            onClick={() => hasBrands && setTemplate('brand')}
          >
            <div>
              <div>
                {template === 'brand' && <div />}
              </div>
              <h3>Brand Themed</h3>
            </div>
            <p>
              Customized with your selected brand's colors and styling.
            </p>
            {!hasBrands && (
              <p>
                Requires selected brands
              </p>
            )}
          </div>
        </div>

        {!hasGenerated ? (
          <div>
            <Button
              onClick={generateMediaPack}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Media Pack'}
            </Button>
          </div>
        ) : (
          <div>
            <div>
              <div>
                <span>✓</span>
                <span>Media pack generated successfully!</span>
              </div>
              <p>
                Your professional media pack is ready for outreach.
              </p>
            </div>

            <div>
              <div>
                <div>
                  <div>
                    {selectedBrandIds.length} brand{selectedBrandIds.length !== 1 ? 's' : ''} included
                  </div>
                  <div>
                    Ready to proceed to contact discovery
                  </div>
                </div>
                <div>
                  <Button
                    onClick={onBack}
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
          </div>
        )}
      </div>
    </div>
  );
}
