import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Layers,
  BookOpen,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RetentionQuiz, SubjectId, QuizQuestion } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SUBJECTS } from '../data/subjects';

interface RetentionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: RetentionQuiz | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onAddMissedToFlashcards?: (question: QuizQuestion, subject: SubjectId) => void;
}

export const RetentionQuizModal: React.FC<RetentionQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  isLoading,
  onRegenerate,
  onAddMissedToFlashcards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ [qIndex: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [addedCards, setAddedCards] = useState<{ [qId: string]: boolean }>({});

  // Reset quiz state when new quiz is loaded
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAnswers({});
    setIsFinished(false);
    setAddedCards({});
  }, [quiz?.id]);

  if (!isOpen) return null;

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];
  const subjectObj = SUBJECTS.find((s) => s.id === quiz?.subject) || SUBJECTS[0];

  // Calculate score
  const correctCount = Object.entries(answers).reduce((acc, [idx, chosen]) => {
    const q = questions[parseInt(idx, 10)];
    return q && q.correctIndex === chosen ? acc + 1 : acc;
  }, 0);

  // Trigger celebration on high score completion
  const handleFinishQuiz = (finalAnswers: { [qIndex: number]: number }) => {
    setIsFinished(true);
    let finalScore = 0;
    questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) finalScore++;
    });

    if (finalScore >= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitCurrentAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const updatedAnswers = { ...answers, [currentIndex]: selectedOption };
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      handleFinishQuiz(answers);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAnswers({});
    setIsFinished(false);
  };

  const handleAddFlashcard = (q: QuizQuestion) => {
    if (onAddMissedToFlashcards && quiz?.subject) {
      onAddMissedToFlashcards(q, quiz.subject);
      setAddedCards((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[720px] text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  5-Question Retention Check
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {subjectObj.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Testing your recall and problem-solving steps from recent session doubts
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
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-500 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Analyzing Your Last 5 Doubts...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Generating custom retention MCQs specifically covering formulas, key laws, and exam traps from your discussion.
                </p>
              </div>
            </div>
          ) : isFinished ? (
            /* Results & Score Screen */
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2 p-6 rounded-2xl bg-gradient-to-b from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/60">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
                  {correctCount} / {questions.length}
                </div>
                <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {correctCount === 5
                    ? '🌟 Perfect Score! Flawless Retention!'
                    : correctCount >= 4
                    ? '🎉 Excellent Mastery! Exam Ready!'
                    : correctCount >= 3
                    ? '👍 Good Effort! Revise Weak Areas.'
                    : '💡 Need Quick Revision! Check Missed Topics.'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {correctCount >= 4
                    ? 'You have strongly retained the algebraic derivations, rules, and formulas discussed in this chat!'
                    : 'Reinforce any questions you missed by adding them directly to your Kumhud spaced-repetition card deck below.'}
                </p>
              </div>

              {/* Review of all 5 Questions */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Question Review & Explanations
                </h5>

                {questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            Q{idx + 1}: {q.sourceTopic || 'Concept Review'}
                          </span>
                        </div>

                        {!isCorrect && onAddMissedToFlashcards && (
                          <button
                            type="button"
                            onClick={() => handleAddFlashcard(q)}
                            disabled={addedCards[q.id]}
                            className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50"
                          >
                            <Layers className="w-3 h-3" />
                            <span>{addedCards[q.id] ? 'Card Added!' : 'Add to Flashcards'}</span>
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 ml-6">
                        <MarkdownRenderer content={q.question} />
                      </div>

                      <div className="mt-2 ml-6 text-[11px] space-y-1">
                        <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          ✓ Correct: {q.options[q.correctIndex]}
                        </p>
                        {!isCorrect && userAnswer !== undefined && (
                          <p className="text-rose-600 dark:text-rose-400">
                            ✗ Your choice: {q.options[userAnswer]}
                          </p>
                        )}
                        <div className="mt-1 text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700">
                          <MarkdownRenderer content={q.explanation} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Card */
            <div className="space-y-4">
              {/* Question Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQ.sourceTopic && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Topic: {currentQ.sourceTopic}
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Statement */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
                <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  <MarkdownRenderer content={currentQ.question} />
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  let borderStyle = 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600';
                  let bgStyle = 'bg-white dark:bg-slate-800';

                  if (isSelected && !isAnswerSubmitted) {
                    borderStyle = 'border-amber-500 dark:border-amber-500 shadow-xs ring-1 ring-amber-500/20';
                    bgStyle = 'bg-amber-50/50 dark:bg-amber-950/30';
                  }

                  if (isAnswerSubmitted) {
                    if (oIdx === currentQ.correctIndex) {
                      borderStyle = 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20';
                      bgStyle = 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                    } else if (isSelected && oIdx !== currentQ.correctIndex) {
                      borderStyle = 'border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/20';
                      bgStyle = 'bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                    } else {
                      bgStyle = 'opacity-60 bg-white dark:bg-slate-800';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${borderStyle} ${bgStyle}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <div className="min-w-0">
                          <MarkdownRenderer content={opt.replace(/^[A-D]\)\s*/, '')} />
                        </div>
                      </div>

                      {isAnswerSubmitted && oIdx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && oIdx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Step-by-Step Educational Explanation Card */}
              {isAnswerSubmitted && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Concept Explanation:</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <MarkdownRenderer content={currentQ.explanation} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto opacity-40 text-amber-500" />
              <p className="text-xs">No questions loaded for this quiz.</p>
              <button
                type="button"
                onClick={onRegenerate}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
              >
                Generate Quiz
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-2">
          {isFinished ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New Retention Check</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitCurrentAnswer}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <span>{currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

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
