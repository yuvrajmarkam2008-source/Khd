import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  PlusCircle,
  Clock,
  Bookmark,
  BookOpen,
  Layers,
  FileDown,
  Globe,
  Dices,
  Sparkles,
  CornerDownLeft,
  X,
  Keyboard,
  Users,
} from 'lucide-react';
import { SubjectId, Language } from '../types';
import { SUBJECTS } from '../data/subjects';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Subjects' | 'Languages' | 'Practice';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenModules: () => void;
  onOpenFlashcards: () => void;
  onOpenSummary?: () => void;
  onOpenStudyRoom?: () => void;
  onDownloadPDF: () => void;
  hasMessages: boolean;
  onSelectSubject: (subject: SubjectId) => void;
  onSelectLanguage: (language: Language) => void;
  currentLanguage: Language;
  onRandomQuestion: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onOpenHistory,
  onOpenBookmarks,
  onOpenModules,
  onOpenFlashcards,
  onOpenSummary,
  onOpenStudyRoom,
  onDownloadPDF,
  hasMessages,
  onSelectSubject,
  onSelectLanguage,
  currentLanguage,
  onRandomQuestion,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list
  const commands: CommandItem[] = [
    {
      id: 'new_chat',
      title: 'Start New Study Chat',
      subtitle: 'Clear current conversation and ask a fresh doubt',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl + N',
      action: () => {
        onNewChat();
        onClose();
      },
    },
    {
      id: 'flashcards',
      title: 'Spaced-Repetition Flashcards',
      subtitle: 'Review formula decks and revision cards with SM-2 spacing',
      category: 'Actions',
      icon: <Layers className="w-4 h-4 text-violet-500" />,
      shortcut: 'Cards',
      action: () => {
        onOpenFlashcards();
        onClose();
      },
    },
    {
      id: 'history',
      title: 'Chat History Archive',
      subtitle: 'Browse previous study questions and solutions',
      category: 'Actions',
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      shortcut: 'Ctrl + H',
      action: () => {
        onOpenHistory();
        onClose();
      },
    },
    {
      id: 'bookmarks',
      title: 'Saved Bookmarks & Formulas',
      subtitle: 'View your pinned questions and step-by-step solutions',
      category: 'Actions',
      icon: <Bookmark className="w-4 h-4 text-amber-500" />,
      shortcut: 'Ctrl + B',
      action: () => {
        onOpenBookmarks();
        onClose();
      },
    },
    {
      id: 'modules',
      title: 'Syllabus Learning Modules',
      subtitle: 'Structured key concepts, formulas & practice problems',
      category: 'Actions',
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl + M',
      action: () => {
        onOpenModules();
        onClose();
      },
    },
    ...(onOpenStudyRoom
      ? [
          {
            id: 'study_room',
            title: 'Virtual Study Room Lobby',
            subtitle: 'Join shared lobby, see collective doubt trends & active peers',
            category: 'Actions' as const,
            icon: <Users className="w-4 h-4 text-emerald-500" />,
            shortcut: 'Room',
            action: () => {
              onOpenStudyRoom();
              onClose();
            },
          },
        ]
      : []),
    ...(hasMessages
      ? [
          ...(onOpenSummary
            ? [
                {
                  id: 'session_summary',
                  title: 'Generate Session Revision Summary',
                  subtitle: 'Condense conversation into core formulas, concepts & rapid quiz',
                  category: 'Actions' as const,
                  icon: <Sparkles className="w-4 h-4 text-pink-500" />,
                  shortcut: 'Summary',
                  action: () => {
                    onOpenSummary();
                    onClose();
                  },
                },
              ]
            : []),
          {
            id: 'export_pdf',
            title: 'Export Notes to PDF',
            subtitle: 'Download current study chat as a formatted PDF',
            category: 'Actions' as const,
            icon: <FileDown className="w-4 h-4 text-emerald-500" />,
            shortcut: 'Save PDF',
            action: () => {
              onDownloadPDF();
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'random_question',
      title: 'Random Board Exam Doubt',
      subtitle: 'Ask an interesting practice problem from current subject',
      category: 'Practice',
      icon: <Dices className="w-4 h-4 text-pink-500" />,
      action: () => {
        onRandomQuestion();
        onClose();
      },
    },
    // Subjects
    ...SUBJECTS.map((sub) => ({
      id: `subj_${sub.id}`,
      title: `Switch to ${sub.name} (${sub.hindiName})`,
      subtitle: sub.tagline,
      category: 'Subjects' as const,
      icon: <span className="text-base select-none">{sub.icon}</span>,
      action: () => {
        onSelectSubject(sub.id);
        onClose();
      },
    })),
    // Languages
    {
      id: 'lang_en',
      title: 'Switch Language: English',
      subtitle: 'Responses and solutions in clear English',
      category: 'Languages',
      icon: <Globe className="w-4 h-4 text-sky-500" />,
      shortcut: currentLanguage === 'english' ? 'Active' : undefined,
      action: () => {
        onSelectLanguage('english');
        onClose();
      },
    },
    {
      id: 'lang_hi',
      title: 'Switch Language: हिंदी (Hindi)',
      subtitle: 'हिंदी माध्यम में संपूर्ण चरणबद्ध समाधान',
      category: 'Languages',
      icon: <Globe className="w-4 h-4 text-orange-500" />,
      shortcut: currentLanguage === 'hindi' ? 'Active' : undefined,
      action: () => {
        onSelectLanguage('hindi');
        onClose();
      },
    },
    {
      id: 'lang_hinglish',
      title: 'Switch Language: Hinglish',
      subtitle: 'Mix of Hindi & English for natural student understanding',
      category: 'Languages',
      icon: <Globe className="w-4 h-4 text-emerald-500" />,
      shortcut: currentLanguage === 'hinglish' ? 'Active' : undefined,
      action: () => {
        onSelectLanguage('hinglish');
        onClose();
      },
    },
  ];

  // Filter commands
  const filteredCommands = commands.filter((cmd) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(query) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query)) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  // Handle keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search (e.g. Maths, Flashcards, PDF, हिंदी)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Command Items List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 max-h-[420px] scrollbar-none"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1.5">
              <Keyboard className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">No matching commands found.</p>
              <p className="text-[11px] text-slate-500">
                Try searching for subjects, bookmarks, flashcards, or language settings.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                Enter
              </kbd>
              <span>Select</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                Ctrl + Enter
              </kbd>
              <span>Send Msg</span>
            </span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Kumhud Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
