'use client';

import { useState, useEffect } from 'react';
import { isDevelopment } from '@/lib/config';

export function DemoToggle() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled via cookie
    const demoCookie = document.cookie.includes('demo=1');
    setIsDemoMode(demoCookie);
  }, []);

  const toggleDemoMode = async () => {
    if (!isDevelopment()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/demo/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !isDemoMode }),
      });

      if (response.ok) {
        const newDemoMode = !isDemoMode;
        setIsDemoMode(newDemoMode);
        
        // Set/remove cookie
        if (newDemoMode) {
          document.cookie = 'demo=1; path=/; max-age=3600'; // 1 hour
        } else {
          document.cookie = 'demo=1; path=/; max-age=0'; // Remove
        }
        
        // Reload page to apply demo mode
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only render in development
  if (!isDevelopment()) {
    return null;
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
      <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Demo Mode (Development Only)</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[var(--panel)] rounded-lg">
          <div>
            <h3 className="font-medium text-[var(--text)]">Demo Mode</h3>
            <p className="text-sm text-[var(--muted)]">
              {isDemoMode 
                ? 'Enabled - Using mock services and demo data' 
                : 'Disabled - Using real services'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDemoMode 
                ? 'bg-[var(--warning)]/20 text-[var(--warning)]' 
                : 'bg-[var(--muted)]/20 text-[var(--muted)]'
            }`}>
              {isDemoMode ? 'ON' : 'OFF'}
            </div>
            
            <button
              onClick={toggleDemoMode}
              disabled={isLoading}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                isDemoMode
                  ? 'bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white'
                  : 'bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Toggling...' : (isDemoMode ? 'Disable Demo' : 'Enable Demo')}
            </button>
          </div>
        </div>

        <div className="p-4 bg-[var(--panel)] rounded-lg">
          <h4 className="font-medium text-[var(--text)] mb-2">What Demo Mode Does:</h4>
          <ul className="text-sm text-[var(--muted)] space-y-1">
            <li>• Uses mock services instead of real API calls</li>
            <li>• Provides instant, realistic test data</li>
            <li>• Logs emails to console instead of sending</li>
            <li>• Generates demo media packs</li>
            <li>• Perfect for testing and demos</li>
          </ul>
        </div>

        <div className="p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--warning)]">⚠️</span>
            <span className="text-sm font-medium text-[var(--text)]">Development Only</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            This toggle only works in development mode and requires a page reload to take effect.
          </p>
        </div>
      </div>
    </div>
  );
}
