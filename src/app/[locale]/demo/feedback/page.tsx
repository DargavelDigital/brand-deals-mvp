'use client';

import { useState } from 'react';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons';

export default function FeedbackDemoPage() {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string>('');

  const handleFeedbackSubmitted = (decision: 'UP' | 'DOWN', comment?: string) => {
    setFeedbackSubmitted(`Feedback submitted: ${decision}${comment ? ` - "${comment}"` : ''}`);
    setTimeout(() => setFeedbackSubmitted(''), 5000);
  };

  return (
    <Section title="AI Feedback Demo" description="Test the human-in-the-loop feedback system">
      <div className="space-y-6">
        {/* Success Message */}
        {feedbackSubmitted && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-green-800">{feedbackSubmitted}</div>
          </Card>
        )}

        {/* Brand Match Feedback */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Brand Match Feedback</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">GymShark - Fitness Brand</h4>
                <p className="text-sm text-gray-600 mb-3">
                  AI suggested this brand based on your fitness content and UK audience.
                </p>
                <AiFeedbackButtons
                  type="MATCH"
                  targetId="brand_gymshark"
                  showComment={true}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Patagonia - Sustainable Fashion</h4>
                <p className="text-sm text-gray-600 mb-3">
                  AI matched this brand for your sustainable lifestyle content.
                </p>
                <AiFeedbackButtons
                  type="MATCH"
                  targetId="brand_patagonia"
                  showComment={true}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Outreach Email Feedback */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Outreach Email Feedback</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Professional Collaboration Pitch</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Subject:</strong> Collaboration opportunity for fitness community</p>
                  <p><strong>Body:</strong> Hi team, I'm reaching out about a potential collaboration...</p>
                </div>
                <AiFeedbackButtons
                  type="OUTREACH"
                  targetId="email_professional"
                  showComment={true}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Casual Gaming Partnership</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Subject:</strong> Gaming collaboration idea</p>
                  <p><strong>Body:</strong> Hey! I love your games and think we could create something amazing...</p>
                </div>
                <AiFeedbackButtons
                  type="OUTREACH"
                  targetId="email_casual"
                  showComment={true}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Insights Feedback */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Insights Feedback</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Creator Profile Analysis</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Strengths:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>High engagement rate (8.9%)</li>
                    <li>Niche focus on sustainable living</li>
                    <li>Authentic content style</li>
                  </ul>
                  <p><strong>Areas for improvement:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Limited brand diversity</li>
                    <li>Small audience size</li>
                  </ul>
                </div>
                <AiFeedbackButtons
                  type="AUDIT"
                  targetId="audit_creator_profile"
                  showComment={true}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback Summary */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">MATCH</div>
                <div className="text-sm text-gray-600">Brand Suggestions</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.open('/api/feedback/summary?type=MATCH', '_blank')}
                >
                  View Summary
                </Button>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">OUTREACH</div>
                <div className="text-sm text-gray-600">Email Quality</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.open('/api/feedback/summary?type=OUTREACH', '_blank')}
                >
                  View Summary
                </Button>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">AUDIT</div>
                <div className="text-sm text-gray-600">Profile Analysis</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.open('/api/feedback/summary?type=AUDIT', '_blank')}
                >
                  View Summary
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. <strong>Give Feedback:</strong> Click 👍 or 👎 on any AI-generated content</p>
              <p>2. <strong>Add Comments:</strong> For negative feedback, optionally explain what could be improved</p>
              <p>3. <strong>Track Quality:</strong> View community feedback ratios and trends</p>
              <p>4. <strong>Improve AI:</strong> Your feedback helps train and improve the AI models</p>
              <p>5. <strong>Monitor Drift:</strong> Low approval rates trigger alerts in the AI Quality dashboard</p>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
