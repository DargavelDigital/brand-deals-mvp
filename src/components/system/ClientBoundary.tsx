'use client'
import React from 'react'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props:any){ super(props); this.state = { error: null } }
  static getDerivedStateFromError(error: Error){ return { error } }
  componentDidCatch(error:Error, info:any){ /* Error logged to boundary */ }
  render(){
    if (this.state.error) {
      return (
        <div className="card p-4">
          <div className="font-medium mb-2">Brand Run failed to render</div>
          <pre className="text-xs text-[var(--muted-fg)] overflow-auto">
            {this.state.error?.message || 
             (this.state.error instanceof Error ? this.state.error.stack : 
              (this.state.error?.toString?.() || 'Unknown error'))}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ClientBoundary({ children }:{ children: React.ReactNode }){
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(()=>{ 
    setMounted(true) 
  },[])
  
  // Show content immediately to prevent hydration mismatch
  return <ErrorBoundary>{children}</ErrorBoundary>
}
