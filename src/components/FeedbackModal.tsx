import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Send, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { FeedbackData } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  question?: string;
  answerSnippet: string;
  initialRating?: 'up' | 'down';
  onSubmitFeedback: (data: FeedbackData) => void;
  subject?: string;
  language?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  messageId,
  question,
  answerSnippet,
  initialRating = 'up',
  onSubmitFeedback,
  subject,
  language,
}) => {
  const [rating, setRating] = useState<'up' | 'down'>(initialRating);
  const [comment, setComment] = useState('');
  const [accuracyRating, setAccuracyRating] = useState<number>(rating === 'up' ? 5 : 2);
  const [clarityRating, setClarityRating] = useState<number>(rating === 'up' ? 5 : 2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      rating,
      comment: comment.trim() || undefined,
      accuracyRating,
      clarityRating,
      submittedAt: Date.now(),
    };

    try {
      // Send to server-side logging endpoint
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          question,
          answer: answerSnippet,
          rating,
          comment: comment.trim() || undefined,
          accuracyRating,
          clarityRating,
          subject,
          language,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to submit feedback to server:', err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    onSubmitFeedback(feedbackData);

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thank you for your feedback!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your rating helps Kumhud become more accurate and helpful for all students.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🪷</span>
                <h3 className="text-lg font-bold">Rate this Explanation</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Was Kumhud's step-by-step solution clear, accurate, and easy to understand?
              </p>
            </div>

            {/* Quick Thumbs Up / Down Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRating('up');
                  setAccuracyRating(5);
                  setClarityRating(5);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all ${
                  rating === 'up'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${rating === 'up' ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                <span>Helpful & Clear</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRating('down');
                  setAccuracyRating(2);
                  setClarityRating(2);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all ${
                  rating === 'down'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${rating === 'down' ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>Needs Improvement</span>
              </button>
            </div>

            {/* Quality Stars */}
            <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Accuracy & Correctness</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAccuracyRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= accuracyRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Clarity of Steps</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClarityRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= clarityRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Detailed Feedback */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Detailed Feedback (Optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={
                  rating === 'up'
                    ? 'What was especially helpful? (e.g. step 2 made it so simple to understand...)'
                    : 'What was unclear or missing? (e.g. needed more detail on the formula derivation...)'
                }
                className="w-full text-xs md:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
