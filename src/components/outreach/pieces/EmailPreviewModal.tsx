'use client';

import { useState, useEffect } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  contact: any; // Contact data
  brand: any; // Brand data
  creator: any; // Creator data
  mediaPack: any; // Media pack data
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  body,
  contact,
  brand,
  creator,
  mediaPack
}: EmailPreviewModalProps) {
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewBody, setPreviewBody] = useState('');

  useEffect(() => {
    // Replace variables with actual data
    const variables = {
      contactFirstName: contact?.firstName || contact?.name?.split(' ')[0] || 'there',
      contactLastName: contact?.lastName || contact?.name?.split(' ').slice(1).join(' ') || '',
      contactEmail: contact?.email || '',
      brandName: brand?.name || 'Your Brand',
      brandWebsite: brand?.website || '',
      creatorName: creator?.name || 'Creator',
      followerCount: creator?.followers?.toLocaleString() || '50K',
      engagementRate: creator?.engagementRate || '4.5',
      niche: creator?.niche || 'lifestyle',
      mediaPackUrl: mediaPack?.url || 'https://example.com/media-pack',
      topMarkets: creator?.topMarkets?.join(', ') || 'US, UK, Canada',
      ageRange: creator?.ageRange || '25-34'
    };

    let processedSubject = subject;
    let processedBody = body;

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedSubject = processedSubject.replace(regex, value);
      processedBody = processedBody.replace(regex, value);
    });

    setPreviewSubject(processedSubject);
    setPreviewBody(processedBody);
  }, [subject, body, contact, brand, creator, mediaPack]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Email Preview</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {/* Email Preview */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Email Header */}
          <div className="mb-6 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-500 w-16">From:</span>
              <span className="text-sm">{creator?.email || 'you@example.com'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-500 w-16">To:</span>
              <span className="text-sm">{contact?.email || 'contact@brand.com'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-500 w-16">Subject:</span>
              <span className="text-sm font-semibold">{previewSubject}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="border-t pt-6">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {previewBody}
            </div>
          </div>

          {/* Variable Legend */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-xs font-medium text-blue-900 mb-2">📝 Variables Replaced:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              {Object.entries({
                contactFirstName: contact?.firstName || contact?.name?.split(' ')[0] || 'there',
                brandName: brand?.name || 'Your Brand',
                creatorName: creator?.name || 'Creator',
                followerCount: creator?.followers?.toLocaleString() || '50K',
                mediaPackUrl: mediaPack?.url || 'https://example.com/media-pack'
              }).map(([key, value]) => {
                const isUsed = subject.includes(`{{${key}}}`) || body.includes(`{{${key}}}`);
                if (!isUsed) return null;
                return (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-mono">{`{{${key}}}`}</span>
                    <span>→</span>
                    <span className="truncate">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            This is how your email will appear to the recipient
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

