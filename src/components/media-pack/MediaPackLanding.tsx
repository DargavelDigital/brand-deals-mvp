'use client'
import { useEffect, useState } from 'react'
import { CTA } from './CTA'
import { ScrollTracker } from './ScrollTracker'
import TrackingSnippet from './TrackingSnippet'

interface MediaPackLandingProps {
  pack: any
  variant: string
}

export function MediaPackLanding({ pack, variant }: MediaPackLandingProps) {
  const [scrollDepth, setScrollDepth] = useState(0)

  // Track scroll depth for analytics
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const depth = Math.round((scrolled / maxScroll) * 100)
      
      if (depth > scrollDepth && (depth === 25 || depth === 50 || depth === 75 || depth === 100)) {
        setScrollDepth(depth)
        // Log scroll depth milestone
        fetch("/api/media-pack/scroll", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mediaPackId: pack.id, 
            variant, 
            event: "scroll", 
            value: depth 
          }),
        }).catch(() => {})
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pack.id, variant, scrollDepth])

  const renderVariant = () => {
    switch (variant) {
      case 'bold':
        return <BoldVariant pack={pack} />
      case 'editorial':
        return <EditorialVariant pack={pack} />
      default:
        return <ClassicVariant pack={pack} />
    }
  }

  return (
    <div className="relative">
      <TrackingSnippet 
        shareToken={pack.shareToken || pack.id} 
        variant={variant} 
        ctas={['cta-book', 'cta-proposal']}
      />
      <ScrollTracker />
      {renderVariant()}
      
      {/* Conversion CTAs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <CTA 
          mediaPackId={pack.id} 
          type="call" 
          variant={variant}
          className="shadow-lg"
        />
        <CTA 
          mediaPackId={pack.id} 
          type="proposal" 
          variant={variant}
          className="shadow-lg"
        />
      </div>
    </div>
  )
}

function ClassicVariant({ pack }: { pack: any }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {pack.workspace.name} Media Pack
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Professional partnership opportunities and audience insights
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              About Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {pack.workspace.description || 'Professional content creator with engaged audience and proven track record of successful brand partnerships.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Partnership Types
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Sponsored content & product reviews</li>
              <li>• Brand ambassador programs</li>
              <li>• Event appearances & collaborations</li>
              <li>• Custom content creation</li>
            </ul>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Ready to discuss partnership opportunities?</p>
              <p>Let's create something amazing together!</p>
            </div>
          </section>

          <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Next Steps
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>1. Schedule a discovery call</li>
              <li>2. Review partnership proposal</li>
              <li>3. Define campaign objectives</li>
              <li>4. Launch successful collaboration</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}

function BoldVariant({ pack }: { pack: any }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-6">
          {pack.workspace.name}
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
          MEDIA PACK
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Audience</h3>
          <p className="text-blue-100">Engaged followers ready for your brand</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Reach</h3>
          <p className="text-green-100">Maximum exposure for your message</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Results</h3>
          <p className="text-orange-100">Proven track record of success</p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Ready to Dominate Your Market?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Let's create a partnership that drives real business results.
        </p>
      </div>
    </div>
  )
}

function EditorialVariant({ pack }: { pack: any }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-light text-gray-900 dark:text-white mb-6">
          {pack.workspace.name}
        </h1>
        <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
        <p className="text-lg text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Media Kit
        </p>
      </header>

      <div className="prose prose-lg max-w-none text-center">
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
          A curated selection of partnership opportunities designed for brands who value authenticity, 
          creativity, and measurable impact in their marketing strategies.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-16 mt-16">
        <div>
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">
            Our Approach
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We believe in creating meaningful connections between brands and audiences through 
            authentic storytelling and strategic content partnerships.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">
            Partnership Vision
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Long-term collaborations that benefit all parties: your brand, our audience, 
            and the creative community we're building together.
          </p>
        </div>
      </div>
    </div>
  )
}
