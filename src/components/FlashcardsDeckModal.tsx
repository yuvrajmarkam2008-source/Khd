import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  BookOpen,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, ReviewRating, SubjectId } from '../types';
import { SUBJECTS } from '../data/subjects';
import { calculateNextReview } from '../utils/flashcards';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FlashcardsDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
  onDeleteCard: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const FlashcardsDeckModal: React.FC<FlashcardsDeckModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  onUpdateCard,
  onDeleteCard,
  onOpenCreateModal,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [mode, setMode] = useState<'overview' | 'review'>('overview');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'due' | 'all'>('due');

  // Filtered cards by subject
  const subjectCards = useMemo(() => {
    return flashcards.filter(
      (c) => selectedSubject === 'all' || c.subject === selectedSubject
    );
  }, [flashcards, selectedSubject]);

  // Cards due for review (nextReviewDate <= Date.now())
  const dueCards = useMemo(() => {
    const now = Date.now();
    return subjectCards.filter((c) => c.nextReviewDate <= now);
  }, [subjectCards]);

  // Active review deck
  const reviewDeck = useMemo(() => {
    return reviewFilter === 'due' ? dueCards : subjectCards;
  }, [reviewFilter, dueCards, subjectCards]);

  const currentCard = reviewDeck[currentReviewIndex];

  // Stats
  const masteredCount = subjectCards.filter((c) => c.status === 'mastered').length;
  const learningCount = subjectCards.filter((c) => c.status === 'learning').length;
  const newCount = subjectCards.filter((c) => c.status === 'new').length;

  const handleStartReview = (filter: 'due' | 'all') => {
    setReviewFilter(filter);
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setMode('review');
  };

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return;

    const updated = calculateNextReview(currentCard, rating);
    onUpdateCard(updated);

    if (currentReviewIndex + 1 < reviewDeck.length) {
      setIsFlipped(false);
      setCurrentReviewIndex((prev) => prev + 1);
    } else {
      // Completed session!
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
      setMode('overview');
      setIsFlipped(false);
      setCurrentReviewIndex(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[750px]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Spaced Repetition Flashcards
                </h3>
                {dueCards.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {dueCards.length} due
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Master scientific formulas and concepts with scientifically-spaced intervals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'review' ? (
              <button
                type="button"
                onClick={() => setMode('overview')}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                Exit Review
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Card</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Content */}
        {mode === 'overview' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Subject Filter Bar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubject('all')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                All Subjects ({flashcards.length})
              </button>
              {SUBJECTS.map((sub) => {
                const count = flashcards.filter((c) => c.subject === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                      selectedSubject === sub.id
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Metrics Bar */}
            <div className="p-3 sm:p-4 grid grid-cols-3 gap-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-850">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Due For Review
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {dueCards.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Learning / Active
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {learningCount + newCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mastered Concepts
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {masteredCount}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 sm:p-4 flex items-center justify-between gap-2 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {dueCards.length > 0 ? (
                  <span>
                    <strong>{dueCards.length} cards</strong> ready for spaced review today.
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All cards reviewed for today!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {subjectCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStartReview('all')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Review All ({subjectCards.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleStartReview('due')}
                  disabled={dueCards.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Due Review ({dueCards.length})</span>
                </button>
              </div>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {subjectCards.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs font-medium">No flashcards in this subject yet.</p>
                  <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Flashcard</span>
                  </button>
                </div>
              ) : (
                subjectCards.map((card) => {
                  const subjectObj = SUBJECTS.find((s) => s.id === card.subject);
                  const isDue = card.nextReviewDate <= Date.now();

                  return (
                    <div
                      key={card.id}
                      className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-slate-700 transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{subjectObj?.icon || '🔖'}</span>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {subjectObj?.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                              card.status === 'mastered'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : card.status === 'learning'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {card.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isDue ? (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                              Due Now
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Next in {card.interval}d
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteCard(card.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete flashcard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Front text */}
                      <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {card.front}
                      </p>

                      {/* Back summary */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg line-clamp-2 font-mono">
                        {card.back}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Interactive Spaced Repetition Review Deck */
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
            {reviewDeck.length === 0 || !currentCard ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  All Caught Up!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  You have reviewed all cards in this session. Great job reinforcing your memory!
                </p>
                <button
                  type="button"
                  onClick={() => setMode('overview')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Return to Flashcards Overview
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>
                      Card {currentReviewIndex + 1} of {reviewDeck.length}
                    </span>
                    <span className="uppercase text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {SUBJECTS.find((s) => s.id === currentCard.subject)?.name || 'Study'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${((currentReviewIndex + 1) / reviewDeck.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3D Interactive Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`flex-1 min-h-[260px] rounded-2xl border-2 p-5 sm:p-6 cursor-pointer select-none transition-all flex flex-col justify-between shadow-lg relative ${
                    isFlipped
                      ? 'border-indigo-400 bg-white dark:bg-slate-850 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-850 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="uppercase tracking-wider">
                      {isFlipped ? '💡 Answer / Explanation' : '❓ Concept / Prompt'}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-500">
                      <RotateCw className="w-3 h-3" />
                      <span>{isFlipped ? 'Click to show question' : 'Click to reveal answer'}</span>
                    </span>
                  </div>

                  <div className="flex-1 py-4 flex flex-col justify-center overflow-y-auto">
                    {isFlipped ? (
                      <div className="text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 font-sans">
                        <MarkdownRenderer content={currentCard.back} />
                      </div>
                    ) : (
                      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                        <MarkdownRenderer content={currentCard.front} />
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {isFlipped ? 'Rate your recall below:' : 'Try recalling before flipping!'}
                  </div>
                </div>

                {/* Spaced-Repetition Rating Buttons */}
                {isFlipped ? (
                  <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <button
                      type="button"
                      onClick={() => handleRate('again')}
                      className="p-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-center transition-colors shadow-xs"
                    >
                      <span className="block text-xs font-bold">Again</span>
                      <span className="text-[10px] opacity-75">1 day</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate('hard')}
                      className="p-2 sm:p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-center transition-colors shadow-xs"
                    >
                      <span className="block text-xs font-bold">Hard</span>
                      <span className="text-[10px] opacity-75">{Math.max(1, Math.round(currentCard.interval * 1.2))}d</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate('good')}
                      className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-center transition-colors shadow-xs"
                    >
                      <span className="block text-xs font-bold">Good</span>
                      <span className="text-[10px] opacity-75">
                        {currentCard.repetition === 0 ? 1 : Math.round(currentCard.interval * currentCard.easeFactor)}d
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate('easy')}
                      className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-center transition-colors shadow-xs"
                    >
                      <span className="block text-xs font-bold">Easy</span>
                      <span className="text-[10px] opacity-75">
                        {Math.round(currentCard.interval * currentCard.easeFactor * 1.3)}d
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Show Answer</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
