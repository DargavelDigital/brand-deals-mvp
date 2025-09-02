'use client'
import React from 'react'
import { X, FileText, Download, Eye } from 'lucide-react'

interface MediaPackPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  variant: string
  packId: string
}

export default function MediaPackPreviewModal({ 
  isOpen, 
  onClose, 
  variant, 
  packId 
}: MediaPackPreviewModalProps) {
  if (!isOpen) return null

  const variants = {
    classic: {
      name: 'Classic',
      description: 'Clean, professional design with traditional layout',
      features: ['Professional typography', 'Clean white space', 'Corporate color scheme', 'Standard layout']
    },
    bold: {
      name: 'Bold',
      description: 'Modern, eye-catching layout with vibrant colors',
      features: ['Bold typography', 'Vibrant color palette', 'Modern graphics', 'Dynamic layout']
    },
    editorial: {
      name: 'Editorial',
      description: 'Magazine-style presentation with sophisticated design',
      features: ['Editorial typography', 'Sophisticated layout', 'Premium imagery', 'Magazine-style design']
    }
  }

  const currentVariant = variants[variant as keyof typeof variants] || variants.classic

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Media Pack Preview</h2>
              <p className="text-sm text-muted-foreground">{currentVariant.name} Style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview Image/Description */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="mb-4">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">
                {currentVariant.name} Style Preview
              </h3>
            </div>
            <p className="text-gray-600 mb-4">{currentVariant.description}</p>
            
            {/* Mock preview content */}
            <div className="bg-white rounded border p-4 text-left max-w-md mx-auto">
              <div className="border-b pb-2 mb-3">
                <h4 className="font-semibold text-gray-800">Brand Partnership Proposal</h4>
                <p className="text-sm text-gray-600">Media Pack - {currentVariant.name} Style</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">• Professional brand presentation</p>
                <p className="text-gray-700">• Partnership details and benefits</p>
                <p className="text-gray-700">• Contact information and next steps</p>
                <p className="text-gray-700">• Brand guidelines and assets</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3">Style Features:</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {currentVariant.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Content */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What's Included:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Brand overview and partnership proposal</li>
              <li>• Target audience and market analysis</li>
              <li>• Partnership benefits and value proposition</li>
              <li>• Contact details and next steps</li>
              <li>• Brand assets and guidelines</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Pack ID: {packId} • {currentVariant.name} Style
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close Preview
            </button>
            <button
              onClick={() => {
                // This would trigger the actual generation
                onClose()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Generate & Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
