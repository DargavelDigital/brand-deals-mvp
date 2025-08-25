'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export function DemoToggle() {
  const [demoMode, setDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo/toggle', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setDemoMode(data.demoMode);
        }
      } catch (error) {
        console.error('Failed to check demo mode:', error);
      }
    };

    checkDemoMode();
  }, []);

  const toggleDemoMode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/demo/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !demoMode })
      });

      if (response.ok) {
        const data = await response.json();
        setDemoMode(data.demoMode);
      } else {
        console.error('Failed to toggle demo mode');
      }
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Demo Mode (Development Only)</h2>
      
      <div>
        <div>
          <div>
            <h3>Demo Mode</h3>
            <p>
              Enable demo mode to use mock data and services instead of real API calls.
            </p>
          </div>
          
          <div>
            <div>
              {demoMode ? 'Enabled' : 'Disabled'}
            </div>
            
            <Button
              onClick={toggleDemoMode}
              disabled={isLoading}
            >
              {isLoading ? 'Toggling...' : demoMode ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        <div>
          <h4>What Demo Mode Does:</h4>
          <ul>
            <li>Uses mock data for all API responses</li>
            <li>Simulates AI processing delays</li>
            <li>Provides sample brand matches and contacts</li>
            <li>Generates fake media packs and outreach results</li>
            <li>No real emails are sent</li>
            <li>No real API calls are made</li>
          </ul>
        </div>

        <div>
          <div>
            <span>⚠️</span>
            <span>Development Only</span>
          </div>
          <p>
            Demo mode is intended for development and testing purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
