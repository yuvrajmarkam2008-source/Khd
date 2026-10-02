import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Dumbbell,
  Lightbulb,
  FileDown,
  Layers,
} from 'lucide-react';
import { Message, SubjectId } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { speakText, stopSpeaking } from '../utils/speech';
import { FeedbackModal } from './FeedbackModal';
import { SUBJECTS } from '../data/subjects';
import { exportBookmarkToPDF } from '../utils/pdfExport';

interface MessageItemProps {
  message: Message;
  userQuestion?: string;
  isBookmarked: boolean;
  onToggleBookmark: (message: Message) => void;
  onUpdateFeedback: (messageId: string, feedback: any) => void;
  onQuickAction?: (actionPrompt: string) => void;
  onSaveAsFlashcard?: (front: string, back: string, subject: SubjectId, messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  userQuestion,
  isBookmarked,
  onToggleBookmark,
  onUpdateFeedback,
  onQuickAction,
  onSaveAsFlashcard,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackInitialRating, setFeedbackInitialRating] = useState<'up' | 'down'>('up');

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const started = speakText(message.content, message.language || 'english', () => {
        setIsSpeaking(false);
      });
      if (!started) {
        setIsSpeaking(false);
      }
    }
  };

  const handleThumbsClick = (rating: 'up' | 'down') => {
    setFeedbackInitialRating(rating);
    setShowFeedbackModal(true);
  };

  const subjectInfo = SUBJECTS.find((s) => s.id === message.subject);

  if (isUser) {
    return (
      <div className="flex justify-end my-3 sm:my-4 px-2">
        <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1 opacity-90 text-[11px] font-medium">
            <span className="font-bold flex items-center gap-1">
              <span>You</span>
              {subjectInfo && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-700/80 text-[10px]">
                  {subjectInfo.icon} {subjectInfo.name}
                </span>
              )}
            </span>
            <span className="text-[10px] opacity-75">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-4 sm:my-5 px-2">
      <div className="w-full max-w-[96%] sm:max-w-[90%] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              🪷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Kumhud AI
                </span>
                {subjectInfo && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${subjectInfo.lightBg} ${subjectInfo.borderColor}`}>
                    {subjectInfo.icon} {subjectInfo.name}
                  </span>
                )}
                {message.language && message.language !== 'english' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {message.language === 'hindi' ? 'हिंदी' : 'Hinglish'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy solution"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Read Aloud button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`p-1.5 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 animate-pulse'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSpeaking ? 'Stop Audio' : 'Read Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Download as PDF note */}
            <button
              type="button"
              onClick={() => {
                exportBookmarkToPDF({
                  id: `pdf_${message.id}`,
                  messageId: message.id,
                  question: userQuestion || 'Study Doubt & Concept',
                  answer: message.content,
                  subject: message.subject || 'maths',
                  language: message.language || 'english',
                  createdAt: message.timestamp,
                });
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download this answer as formatted PDF note"
            >
              <FileDown className="w-4 h-4" />
            </button>

            {/* Save as Flashcard */}
            {onSaveAsFlashcard && (
              <button
                type="button"
                onClick={() => {
                  onSaveAsFlashcard(
                    userQuestion || 'Key Concept / Doubt',
                    message.content,
                    message.subject || 'maths',
                    message.id
                  );
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Save as Spaced-Repetition Flashcard"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => onToggleBookmark(message)}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-500'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this Question & Answer'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={message.content} />
          {message.isStreaming && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-3 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thinking & writing step-by-step solution...</span>
            </div>
          )}
        </div>

        {/* Follow-up Study Chips */}
        {!message.isStreaming && onQuickAction && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Next:</span>
            </span>
            <button
              type="button"
              onClick={() => onQuickAction('Please explain this in simpler terms with an everyday analogy.')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium shrink-0 transition-colors flex items-center gap-1 border border-slate-200/60 dark:border-slate-700"
            >
              <span>Explain Simpler</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('Give me 2 similar practice questions with solutions to test my skills.')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium shrink-0 transition-colors flex items-center gap-1 border border-slate-200/60 dark:border-slate-700"
            >
              <Dumbbell className="w-3 h-3" />
              <span>Practice Questions</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('Give me a 1-question quick quiz (with 4 options) based on this concept.')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium shrink-0 transition-colors flex items-center gap-1 border border-slate-200/60 dark:border-slate-700"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Quiz Me</span>
            </button>
          </div>
        )}

        {/* Feedback Bar */}
        {!message.isStreaming && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Was this solution helpful?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleThumbsClick('up')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors ${
                  message.feedback?.rating === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
                title="Helpful & clear"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${message.feedback?.rating === 'up' ? 'fill-emerald-500' : ''}`} />
                <span className="text-[11px]">{message.feedback?.rating === 'up' ? 'Helpful' : 'Yes'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThumbsClick('down')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
                  message.feedback?.rating === 'down'
                    ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
                title="Needs improvement"
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${message.feedback?.rating === 'down' ? 'fill-rose-500' : ''}`} />
                <span className="text-[11px]">{message.feedback?.rating === 'down' ? 'Needs work' : 'No'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        messageId={message.id}
        question={userQuestion}
        answerSnippet={message.content}
        initialRating={feedbackInitialRating}
        onSubmitFeedback={(data) => {
          onUpdateFeedback(message.id, data);
        }}
        subject={subjectInfo?.name}
        language={message.language}
      />
    </div>
  );
};
