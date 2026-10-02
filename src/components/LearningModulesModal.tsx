import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, CheckCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { LearningModule, SubjectId } from '../types';
import { LEARNING_MODULES } from '../data/learningModules';
import { SUBJECTS } from '../data/subjects';

interface LearningModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPracticeQuestion: (question: string, subject: SubjectId) => void;
  initialSubject?: SubjectId;
}

export const LearningModulesModal: React.FC<LearningModulesModalProps> = ({
  isOpen,
  onClose,
  onSelectPracticeQuestion,
  initialSubject = 'maths',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject);
  const [activeModuleId, setActiveModuleId] = useState<string>(
    LEARNING_MODULES.find((m) => m.subject === initialSubject)?.id || LEARNING_MODULES[0].id
  );
  const [revealedSolutions, setRevealedSolutions] = useState<{ [key: string]: boolean }>({});

  const handleSubjectTab = (subjId: SubjectId) => {
    setSelectedSubject(subjId);
    const mod = LEARNING_MODULES.find((m) => m.subject === subjId);
    if (mod) setActiveModuleId(mod.id);
  };

  const currentModule =
    LEARNING_MODULES.find((m) => m.id === activeModuleId) ||
    LEARNING_MODULES.find((m) => m.subject === selectedSubject) ||
    LEARNING_MODULES[0];

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl h-[92vh] sm:h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-base">
              📚
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Structured Learning Modules</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core concepts, formulas, and step-by-step practice problems for exams
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubjectTab(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Module Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-800/60">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {SUBJECTS.find((s) => s.id === currentModule.subject)?.name} Foundation Module
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {currentModule.title}
            </h3>
            {currentModule.hindiTitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {currentModule.hindiTitle}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {currentModule.overview}
            </p>
          </div>

          {/* Key Concepts Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Key Concepts & Formulas</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentModule.keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {concept.title}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                    {concept.description}
                  </p>
                  {concept.formulaOrRule && (
                    <div className="ml-7 mt-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-600 dark:text-indigo-300 font-semibold">
                      {concept.formulaOrRule}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practice Questions with Step-by-Step Answers */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>Practice Questions & Step-by-Step Solutions</span>
            </h4>
            <div className="space-y-4">
              {currentModule.practiceQuestions.map((pq, qIdx) => {
                const isRevealed = !!revealedSolutions[pq.id];
                return (
                  <div
                    key={pq.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          Q{qIdx + 1}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {pq.question}
                          </p>
                          {pq.hint && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                              Hint: {pq.hint}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {pq.difficulty}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => toggleSolution(pq.id)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isRevealed ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectPracticeQuestion(pq.question, currentModule.subject);
                          onClose();
                        }}
                        className="ml-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60"
                      >
                        <span>Ask Kumhud in Chat</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Step-by-Step Solution Body */}
                    {isRevealed && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs leading-relaxed animate-in fade-in duration-150">
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider block">
                          Step-by-Step Explanation:
                        </span>
                        <div className="font-sans whitespace-pre-line text-slate-800 dark:text-slate-200">
                          {pq.stepByStepSolution}
                        </div>
                        <div className="mt-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <span>Final Answer:</span>
                          <span className="text-emerald-700 dark:text-emerald-200">{pq.finalAnswer}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
