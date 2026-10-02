import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileDown,
  Layers,
  RotateCcw,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { SubjectId, Language } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SUBJECTS } from '../data/subjects';
import { exportBookmarkToPDF } from '../utils/pdfExport';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
  onRegenerate: () => void;
  subject: SubjectId;
  language: Language;
  sessionTitle: string;
  onOpenFlashcardCreate?: (front: string, back: string, subject: SubjectId) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  isLoading,
  onRegenerate,
  subject,
  language,
  sessionTitle,
  onOpenFlashcardCreate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subjectObj = SUBJECTS.find((s) => s.id === subject) || SUBJECTS[0];

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    exportBookmarkToPDF({
      id: `summary_${Date.now()}`,
      messageId: `sum_${Date.now()}`,
      question: `Quick Revision Summary: ${sessionTitle}`,
      answer: summary,
      subject,
      language,
      createdAt: Date.now(),
    });
  };

  const handleCreateFlashcard = () => {
    if (onOpenFlashcardCreate) {
      // First section as concept title, rest as explanation
      const lines = summary.split('\n').filter(Boolean);
      const firstHeading = lines.find((l) => l.startsWith('#') || l.startsWith('###'))?.replace(/[#*]/g, '').trim() || `${subjectObj.name} Revision Summary`;
      onOpenFlashcardCreate(firstHeading, summary.slice(0, 1500), subject);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[720px]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Quick Session Revision Summary
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {subjectObj.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Core concepts, mathematical formulas, and exam strategies condensed for rapid recall
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Synthesizing Session Revision Notes...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Extracting key formulas, theorems, problem-solving steps, and high-yield exam tips from your conversation.
                </p>
              </div>
            </div>
          ) : summary ? (
            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
              <MarkdownRenderer content={summary} />
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">No summary generated yet.</p>
              <button
                type="button"
                onClick={onRegenerate}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
              >
                Generate Summary
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Regenerate Summary"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>

            {summary && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Copy Summary to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                  title="Export Summary Notes to PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save PDF</span>
                </button>

                {onOpenFlashcardCreate && (
                  <button
                    type="button"
                    onClick={handleCreateFlashcard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors"
                    title="Turn Summary into a Flashcard"
                  >
                    <Layers className="w-3.5 h-3.5 text-violet-600" />
                    <span className="hidden sm:inline">Add to Flashcard Deck</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
