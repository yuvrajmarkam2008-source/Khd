import React from 'react';
import {
  PlusCircle,
  Clock,
  Bookmark as BookmarkIcon,
  BookOpen,
  Globe,
  FileDown,
  Layers,
  Command,
  Sparkles,
  Users,
} from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenModules: () => void;
  onOpenFlashcards: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSummary?: () => void;
  onOpenStudyRoom?: () => void;
  activeRoomParticipantCount?: number;
  isStudyRoomJoined?: boolean;
  dueFlashcardCount?: number;
  onDownloadPDF?: () => void;
  hasMessages?: boolean;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  onNewChat,
  onOpenHistory,
  onOpenBookmarks,
  onOpenModules,
  onOpenFlashcards,
  onOpenCommandPalette,
  onOpenSummary,
  onOpenStudyRoom,
  activeRoomParticipantCount = 0,
  isStudyRoomJoined = false,
  dueFlashcardCount = 0,
  onDownloadPDF,
  hasMessages = false,
  bookmarkCount,
}) => {
  const languages: { id: Language; label: string; badge: string }[] = [
    { id: 'english', label: 'English', badge: 'EN' },
    { id: 'hindi', label: 'हिंदी', badge: 'हि' },
    { id: 'hinglish', label: 'Hinglish', badge: 'Mix' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNewChat} title="Start New Chat">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <span className="text-xl sm:text-2xl select-none" role="img" aria-label="lotus">
              🪷
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                Kumhud
              </span>
              <span className="hidden xs:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                AI Study
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 -mt-0.5">
              Clear, step-by-step study answers
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Command Palette Trigger Button */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="Open Command Palette (Ctrl + K)"
            >
              <Command className="w-3.5 h-3.5 text-indigo-500" />
              <kbd className="hidden sm:inline-block text-[10px] font-mono opacity-70">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Virtual Study Room Lobby Button */}
          {onOpenStudyRoom && (
            <button
              type="button"
              onClick={onOpenStudyRoom}
              className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                isStudyRoomJoined
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title="Virtual Study Room (Collective Anonymous Trends)"
            >
              <Users className={`w-3.5 h-3.5 ${isStudyRoomJoined ? 'text-emerald-600' : 'text-indigo-500'}`} />
              <span className="hidden md:inline">Study Room</span>
              {isStudyRoomJoined && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </button>
          )}

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="hidden sm:flex items-center pl-2 pr-1 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            {languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLanguage(lang.id)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentLanguage === lang.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={`Switch to ${lang.label}`}
              >
                <span className="sm:hidden">{lang.badge}</span>
                <span className="hidden sm:inline">{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Generate Revision Summary Button */}
          {hasMessages && onOpenSummary && (
            <button
              type="button"
              onClick={onOpenSummary}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-pink-700 dark:text-pink-300 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/50 dark:hover:bg-pink-900/60 transition-colors border border-pink-200 dark:border-pink-800 shadow-xs"
              title="Generate Concise Session Revision Summary"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden md:inline">Summary</span>
            </button>
          )}

          {/* Download Notes as PDF Button */}
          {hasMessages && onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
              title="Download Current Study Notes as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Save PDF</span>
            </button>
          )}

          {/* Spaced Repetition Flashcards Deck Button */}
          <button
            type="button"
            onClick={onOpenFlashcards}
            className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Spaced Repetition Flashcards Deck"
          >
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            <span className="hidden md:inline">Cards</span>
            {dueFlashcardCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {dueFlashcardCount}
              </span>
            )}
          </button>

          {/* Structured Modules Button */}
          <button
            type="button"
            onClick={onOpenModules}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Browse Structured Learning Modules"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Modules</span>
          </button>

          {/* Bookmarks Button */}
          <button
            type="button"
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Saved Bookmarks & Notes"
          >
            <BookmarkIcon className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Chat History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="View Chat History"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">History</span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs shadow-indigo-600/30"
            title="Start New Chat Session"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
