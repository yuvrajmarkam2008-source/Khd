import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Dices,
  HelpCircle,
} from 'lucide-react';
import { SubjectId, Language, StarterPrompt } from '../types';
import { SUBJECTS } from '../data/subjects';

interface WelcomeStateProps {
  activeSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
  onSelectPrompt: (prompt: string) => void;
  onOpenModules: () => void;
  currentLanguage: Language;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({
  activeSubject,
  onSelectSubject,
  onSelectPrompt,
  onOpenModules,
  currentLanguage,
}) => {
  const currentSubjectObj = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  const getGreeting = () => {
    if (currentLanguage === 'hindi') {
      return {
        title: 'नमस्ते! आज आप क्या पढ़ना चाहते हैं?',
        subtitle:
          'गणित, विज्ञान और सभी विषयों के चरणबद्ध (step-by-step) समाधान, सूत्र और परीक्षा टिप्स प्राप्त करें।',
      };
    } else if (currentLanguage === 'hinglish') {
      return {
        title: 'Namaste! Aaj kya study karna hai?',
        subtitle:
          'Maths, Science aur sabhi subjects ke crystal-clear step-by-step solutions, formulas aur exam tips pao.',
      };
    }
    return {
      title: 'What are you studying today?',
      subtitle:
        'Ask any question to receive clear, accurate, step-by-step answers in English, Hindi, or Hinglish.',
    };
  };

  const greeting = getGreeting();

  // Get context prompts for the active subject
  const contextPrompts: StarterPrompt[] = currentSubjectObj.contextPrompts || [];

  // Fallback to sample prompts if context prompts not defined
  const generalPrompts =
    currentSubjectObj.samplePrompts[currentLanguage] || currentSubjectObj.samplePrompts.english;

  const handleRandomQuestion = () => {
    if (contextPrompts.length > 0) {
      const randomPromptObj = contextPrompts[Math.floor(Math.random() * contextPrompts.length)];
      const text = randomPromptObj.prompt[currentLanguage] || randomPromptObj.prompt.english;
      onSelectPrompt(text);
    } else if (generalPrompts.length > 0) {
      const text = generalPrompts[Math.floor(Math.random() * generalPrompts.length)];
      onSelectPrompt(text);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto px-3 sm:px-4 space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Kumhud AI Study Assistant</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {greeting.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {greeting.subtitle}
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Step-by-step derivations</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>KaTeX Math & Chemical Formulas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hindi & Hinglish Support</span>
          </div>
        </div>
      </div>

      {/* Subject Selector Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Select Your Subject</span>
          </h2>
          <button
            type="button"
            onClick={onOpenModules}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Syllabus Modules</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {SUBJECTS.map((sub) => {
            const isSelected = activeSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubject(sub.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{sub.icon}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-950 animate-pulse" />
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {sub.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {sub.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Context-Aware Starter Prompts Section */}
      <div className="space-y-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-purple-50/30 dark:from-indigo-950/30 dark:to-purple-950/10 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
        {/* Context-Aware Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-indigo-100 dark:border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl shadow-xs shrink-0">
              {currentSubjectObj.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {currentSubjectObj.name} Practice & Starter Questions
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {currentLanguage.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentSubjectObj.tagline}
              </p>
            </div>
          </div>

          {/* Random Question Action */}
          <button
            type="button"
            onClick={handleRandomQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs self-start sm:self-auto"
            title="Pick a random board exam practice question"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-500" />
            <span>Random Doubt</span>
          </button>
        </div>

        {/* Context-Aware Starter Prompts Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {contextPrompts.length > 0
            ? contextPrompts.map((cp, idx) => {
                const promptText = cp.prompt[currentLanguage] || cp.prompt.english;
                const categoryLabel =
                  currentLanguage === 'hindi' && cp.categoryHindi
                    ? cp.categoryHindi
                    : cp.category;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPrompt(promptText)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all hover:shadow-md group flex flex-col justify-between gap-2.5 relative"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <span>{cp.icon || '📌'}</span>
                          <span className="truncate">{categoryLabel}</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 shrink-0">
                          {cp.tag}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 leading-snug">
                        "{promptText}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Click to ask Kumhud</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })
            : generalPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPrompt(prompt)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all hover:shadow-xs group flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold text-xs mt-0.5">•</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">
                      {prompt}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </button>
              ))}
        </div>
      </div>

      {/* Study Tips Box */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100">
            Exam Preparation Tip from Kumhud
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Need help with tough homework or competitive exams? Ask Kumhud to{' '}
            <strong>"Explain step-by-step"</strong>, <strong>"Simplify this"</strong>, or{' '}
            <strong>"Generate 3 practice questions"</strong> using the quick action buttons below any answer!
          </p>
        </div>
      </div>
    </div>
  );
};
