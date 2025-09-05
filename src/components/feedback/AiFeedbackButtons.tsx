'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface AiFeedbackButtonsProps {
  type: 'MATCH' | 'OUTREACH' | 'AUDIT';
  targetId: string;
  initialDecision?: 'UP' | 'DOWN' | null;
  showComment?: boolean;
  className?: string;
  onFeedbackSubmitted?: (decision: 'UP' | 'DOWN', comment?: string) => void;
}

export default function AiFeedbackButtons({
  type,
  targetId,
  initialDecision = null,
  showComment = false,
  className = '',
  onFeedbackSubmitted
}: AiFeedbackButtonsProps) {
  const [decision, setDecision] = useState<'UP' | 'DOWN' | null>(initialDecision);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackRatio, setFeedbackRatio] = useState<number | null>(null);

  const handleFeedback = async (newDecision: 'UP' | 'DOWN') => {
    try {
      setSubmitting(true);
      
      const payload: any = {
        type,
        targetId,
        decision: newDecision
      };

      if (showCommentInput && comment.trim()) {
        payload.comment = comment.trim();
      }

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setDecision(newDecision);
      setComment('');
      setShowCommentInput(false);

      // Fetch updated feedback ratio
      await fetchFeedbackRatio();

      // Call callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(newDecision, payload.comment);
      }

    } catch (error) {
      // Error submitting feedback
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFeedbackRatio = async () => {
    try {
      const response = await fetch(`/api/feedback/summary?type=${type}&targetId=${targetId}`);
      if (response.ok) {
        const data = await response.json();
        // Defensive defaults for API response
        const summary = data?.data || {}
        setFeedbackRatio(summary.ratio ?? 0);
      }
    } catch (error) {
      // Error fetching feedback ratio - set to 0 as safe default
      setFeedbackRatio(0);
    }
  };

  // Fetch initial ratio on mount
  useEffect(() => {
    fetchFeedbackRatio();
  }, []);

  const getFeedbackText = () => {
    if (feedbackRatio === null) return '';
    if (feedbackRatio >= 0.8) return 'Most users liked this';
    if (feedbackRatio >= 0.6) return 'Generally well received';
    if (feedbackRatio >= 0.4) return 'Mixed feedback';
    if (feedbackRatio >= 0.2) return 'Some concerns raised';
    return 'Needs improvement';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Feedback Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={decision === 'UP' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFeedback('UP')}
          disabled={submitting}
          className={`flex items-center gap-1 ${
            decision === 'UP' ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          👍
          <span className="text-xs">Good</span>
        </Button>

        <Button
          variant={decision === 'DOWN' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            handleFeedback('DOWN');
            if (showComment) {
              setShowCommentInput(true);
            }
          }}
          disabled={submitting}
          className={`flex items-center gap-1 ${
            decision === 'DOWN' ? 'bg-red-600 hover:bg-red-700' : ''
          }`}
        >
          👎
          <span className="text-xs">Needs work</span>
        </Button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <Card className="p-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              What could be improved?
            </label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowCommentInput(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleFeedback('DOWN')}
                disabled={submitting}
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback Summary */}
      {feedbackRatio !== null && (
        <div className="text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span>Community feedback:</span>
            <span className="font-medium">
              {Math.round(feedbackRatio * 100)}% positive
            </span>
          </div>
          <div className="text-gray-500">{getFeedbackText()}</div>
        </div>
      )}
    </div>
  );
}
