import React, { useState } from 'react';
import {
  X,
  Clock,
  Bookmark,
  Trash2,
  PlusCircle,
  Search,
  MessageSquare,
  ChevronRight,
  FileDown,
  BookOpen,
} from 'lucide-react';
import { ChatSession, Bookmark as BookmarkType, SubjectId } from '../types';
import { SUBJECTS } from '../data/subjects';
import { exportBookmarkToPDF, exportChatSessionToPDF } from '../utils/pdfExport';

interface HistoryAndBookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'history' | 'bookmarks';
  onTabChange: (tab: 'history' | 'bookmarks') => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onNewChat: () => void;
  bookmarks: BookmarkType[];
  onRemoveBookmark: (id: string) => void;
  onOpenBookmarkedInChat: (question: string, answer: string, subject: SubjectId) => void;
}

export const HistoryAndBookmarksDrawer: React.FC<HistoryAndBookmarksDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  onNewChat,
  bookmarks,
  onRemoveBookmark,
  onOpenBookmarkedInChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(query);
    const contentMatch = s.messages.some((m) => m.content.toLowerCase().includes(query));
    return titleMatch || contentMatch;
  });

  // Filtered Bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSubject = selectedSubjectFilter === 'all' || b.subject === selectedSubjectFilter;
    const matchesSearch =
      !searchQuery ||
      b.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪷</span>
            <span className="font-bold text-base text-slate-900 dark:text-white">
              Study Archive & Notes
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chat History ({sessions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('bookmarks')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'history' ? 'Search previous chats...' : 'Search saved questions...'}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Bookmark Subject Filter */}
          {activeTab === 'bookmarks' && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('all')}
                className={`text-[11px] px-2 py-1 rounded-md font-semibold shrink-0 transition-colors ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All
              </button>
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(sub.id)}
                  className={`text-[11px] px-2 py-1 rounded-md font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                    selectedSubjectFilter === sub.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'history' ? (
            /* History List */
            filteredSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">No chat history found.</p>
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start New Study Chat</span>
                </button>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const subjectObj = SUBJECTS.find((s) => s.id === session.subject);
                const lastMsg = session.messages[session.messages.length - 1];

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{subjectObj?.icon || '📚'}</span>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                          {session.title || 'Study Session'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        {session.messages.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportChatSessionToPDF(session);
                            }}
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded-md transition-colors"
                            title="Download chat as formatted PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md transition-opacity"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {lastMsg.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{session.messages.length} messages</span>
                      <span>
                        {new Date(session.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Bookmarks List */
            filteredBookmarks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">No bookmarks saved yet.</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Click the bookmark icon on any AI answer in the chat to save key formulas and step-by-step solutions for quick revision!
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bookmark) => {
                const subjectObj = SUBJECTS.find((s) => s.id === bookmark.subject);
                return (
                  <div
                    key={bookmark.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{subjectObj?.icon || '🔖'}</span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {subjectObj?.name || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => exportBookmarkToPDF(bookmark)}
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded-md transition-colors"
                          title="Download this bookmarked answer as PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveBookmark(bookmark.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Question:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {bookmark.question}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Solution Summary:
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {bookmark.answer}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => exportBookmarkToPDF(bookmark)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <FileDown className="w-3 h-3" />
                        <span>Save PDF Note</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenBookmarkedInChat(bookmark.question, bookmark.answer, bookmark.subject);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Study in Chat</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
          {activeTab === 'history' && sessions.length > 0 && (
            <button
              type="button"
              onClick={onClearAllSessions}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              Clear all history
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
