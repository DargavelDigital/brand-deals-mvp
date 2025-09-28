'use client'
import * as React from 'react'
import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { isEnabledSocial } from '@/lib/launch'

export default function ConnectCardNew({ connectedPlatforms }: { connectedPlatforms: any[] }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')

  const handleConnect = async () => {
    if (!selectedPlatform) return
    
    setIsConnecting(true)
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
  }

  return (
    <div className="card p-5 md:p-6" data-testid="connect-card-new">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Social Media</h3>
          <p className="text-[var(--muted-fg)] text-sm">
            Connect your social media accounts to start discovering brand partnerships.
          </p>
        </div>
        
        <div className="space-y-3">
          <Select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="">Select platform</option>
            {isEnabledSocial('instagram') && <option value="instagram">Instagram</option>}
            {isEnabledSocial('tiktok') && <option value="tiktok">TikTok</option>}
            {isEnabledSocial('youtube') && <option value="youtube">YouTube</option>}
            {isEnabledSocial('x') && <option value="twitter">Twitter</option>}
          </Select>
          
          <Button 
            onClick={handleConnect}
            disabled={!selectedPlatform || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Account'}
          </Button>
        </div>
      </div>
    </div>
  )
}
