import React, { useState, useEffect } from 'react';
import { X, Layers, Sparkles, Check, BookOpen } from 'lucide-react';
import { SubjectId, Flashcard } from '../types';
import { SUBJECTS } from '../data/subjects';

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'repetition' | 'easeFactor' | 'nextReviewDate' | 'status'>) => void;
  defaultFront?: string;
  defaultBack?: string;
  defaultSubject?: SubjectId;
  sourceMessageId?: string;
}

export const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultFront = '',
  defaultBack = '',
  defaultSubject = 'maths',
  sourceMessageId,
}) => {
  const [front, setFront] = useState(defaultFront);
  const [back, setBack] = useState(defaultBack);
  const [subject, setSubject] = useState<SubjectId>(defaultSubject);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFront(defaultFront);
    setBack(defaultBack);
    setSubject(defaultSubject);
    setIsSaved(false);
  }, [defaultFront, defaultBack, defaultSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    onSave({
      front: front.trim(),
      back: back.trim(),
      subject,
      sourceMessageId,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Save to Spaced Repetition Deck
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Turn key definitions, formulas, or steps into revision flashcards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Subject Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Subject
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubject(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    subject === s.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Front of card */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Front (Concept, Term, or Question)
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                Supports $math$
              </span>
            </div>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="e.g. Quadratic Formula & Discriminant Condition"
              required
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Back of card */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Back (Answer, Formula, Definition, or Derivation)
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                KaTeX $$...$$ & Markdown
              </span>
            </div>
            <textarea
              rows={5}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="e.g. x = (-b ± √(b² - 4ac)) / (2a)&#10;&#10;• D > 0: Two real roots&#10;• D = 0: Equal roots"
              required
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Footer controls */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!front.trim() || !back.trim() || isSaved}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs shadow-indigo-600/30"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Deck!</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Add to Deck</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
