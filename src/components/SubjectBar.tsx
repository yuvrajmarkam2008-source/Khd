import React from 'react';
import { SubjectId } from '../types';
import { SUBJECTS } from '../data/subjects';

interface SubjectBarProps {
  activeSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
}

export const SubjectBar: React.FC<SubjectBarProps> = ({ activeSubject, onSelectSubject }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-2 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 mr-1 hidden sm:inline">
          Subjects:
        </span>
        {SUBJECTS.map((sub) => {
          const isActive = activeSubject === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectSubject(sub.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 scale-102'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              <span className="text-sm select-none">{sub.icon}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
