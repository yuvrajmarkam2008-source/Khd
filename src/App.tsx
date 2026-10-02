import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SubjectBar } from './components/SubjectBar';
import { WelcomeState } from './components/WelcomeState';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { HistoryAndBookmarksDrawer } from './components/HistoryAndBookmarksDrawer';
import { LearningModulesModal } from './components/LearningModulesModal';
import { FlashcardsDeckModal } from './components/FlashcardsDeckModal';
import { CreateFlashcardModal } from './components/CreateFlashcardModal';
import { CommandPalette } from './components/CommandPalette';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { VirtualStudyRoomModal } from './components/VirtualStudyRoomModal';
import { Language, SubjectId, Message, ChatSession, Bookmark, FeedbackData, Flashcard, StudyRoom } from './types';
import { SUBJECTS } from './data/subjects';
import { exportChatSessionToPDF } from './utils/pdfExport';
import { loadFlashcards, saveFlashcards } from './utils/flashcards';

const SESSIONS_STORAGE_KEY = 'kumhud_chat_sessions_v1';
const BOOKMARKS_STORAGE_KEY = 'kumhud_bookmarks_v1';
const LANGUAGE_STORAGE_KEY = 'kumhud_preferred_language_v1';

export default function App() {
  // Load preferred language from localStorage
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'hindi' || saved === 'hinglish' || saved === 'english') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'english';
  });

  const [activeSubject, setActiveSubject] = useState<SubjectId>('maths');

  // Load chat sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse sessions from localStorage:', e);
    }
    // Default initial session
    const initialSessionId = `session_${Date.now()}`;
    return [
      {
        id: initialSessionId,
        title: 'New Study Chat',
        subject: 'maths',
        language: 'english',
        messages: [],
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || `session_${Date.now()}`;
  });

  // Load bookmarks from localStorage
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse bookmarks:', e);
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'history' | 'bookmarks'>('history');
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [activeStudyRoom, setActiveStudyRoom] = useState<StudyRoom | null>(() => {
    try {
      const saved = localStorage.getItem('kumhud_active_study_room');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const studyRoomWsRef = useRef<WebSocket | null>(null);

  // Sync activeStudyRoom to localStorage
  useEffect(() => {
    try {
      if (activeStudyRoom) {
        localStorage.setItem('kumhud_active_study_room', JSON.stringify(activeStudyRoom));
      } else {
        localStorage.removeItem('kumhud_active_study_room');
      }
    } catch (e) {}
  }, [activeStudyRoom]);

  // Connect WebSocket when inside a room
  useEffect(() => {
    if (!activeStudyRoom) {
      if (studyRoomWsRef.current) {
        studyRoomWsRef.current.close();
        studyRoomWsRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        studyRoomWsRef.current = ws;

        ws.onopen = () => {
          const pseudonym = localStorage.getItem('kumhud_study_pseudonym') || 'Curious Student';
          ws.send(
            JSON.stringify({
              type: 'join_room',
              roomCode: activeStudyRoom.code,
              pseudonym,
              avatar: '🦉',
              subject: activeSubject,
            })
          );
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.room) {
              setActiveStudyRoom(data.room);
            }
          } catch (e) {
            console.error('Failed to parse WS room message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('WebSocket study room error:', err);
        };
      } catch (err) {
        console.warn('Failed to establish study room WebSocket:', err);
      }
    };

    connectWs();

    // Fallback polling every 10s to keep stats fresh
    const pollInterval = setInterval(async () => {
      if (!isMounted || !activeStudyRoom) return;
      try {
        const res = await fetch(`/api/study-rooms/${activeStudyRoom.code}`);
        const data = await res.json();
        if (data?.room && isMounted) {
          setActiveStudyRoom(data.room);
        }
      } catch (e) {}
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (studyRoomWsRef.current) {
        studyRoomWsRef.current.close();
        studyRoomWsRef.current = null;
      }
    };
  }, [activeStudyRoom?.code]);

  // Join Room Handler
  const handleJoinStudyRoom = async (roomCode: string, pseudonym: string, avatar: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/study-rooms/${roomCode}`);
      const data = await res.json();
      if (data?.room) {
        setActiveStudyRoom(data.room);
        return true;
      }
    } catch (e) {
      console.error('Failed to join study room:', e);
    }
    return false;
  };

  // Create Room Handler
  const handleCreateStudyRoom = async (
    name: string,
    subject: SubjectId | 'all',
    pseudonym: string
  ): Promise<string | null> => {
    try {
      const res = await fetch('/api/study-rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, createdByPseudonym: pseudonym }),
      });
      const data = await res.json();
      if (data?.room) {
        setActiveStudyRoom(data.room);
        return data.room.code;
      }
    } catch (e) {
      console.error('Failed to create study room:', e);
    }
    return null;
  };

  // Leave Room Handler
  const handleLeaveStudyRoom = () => {
    if (studyRoomWsRef.current) {
      studyRoomWsRef.current.close();
      studyRoomWsRef.current = null;
    }
    setActiveStudyRoom(null);
  };

  // Send Reaction in Room
  const handleSendStudyRoomReaction = (emoji: string) => {
    if (!activeStudyRoom) return;
    if (studyRoomWsRef.current && studyRoomWsRef.current.readyState === WebSocket.OPEN) {
      const pseudonym = localStorage.getItem('kumhud_study_pseudonym') || 'Peer';
      studyRoomWsRef.current.send(
        JSON.stringify({
          type: 'send_reaction',
          roomCode: activeStudyRoom.code,
          emoji,
          pseudonym,
        })
      );
    } else {
      fetch(`/api/study-rooms/${activeStudyRoom.code}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      }).catch(console.error);
    }
  };

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => loadFlashcards());

  // Global Keyboard Shortcuts (Ctrl + K, Ctrl + /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Cmd + K -> Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Escape -> close Command Palette
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  const [flashcardPrefill, setFlashcardPrefill] = useState<{
    front: string;
    back: string;
    subject: SubjectId;
    messageId?: string;
  }>({
    front: '',
    back: '',
    subject: 'maths',
  });

  // Sync flashcards to localStorage
  useEffect(() => {
    saveFlashcards(flashcards);
  }, [flashcards]);

  // Clear cached summary when switching sessions
  useEffect(() => {
    setSummaryText('');
  }, [activeSessionId]);

  const dueFlashcardCount = flashcards.filter((c) => c.nextReviewDate <= Date.now()).length;

  const handleOpenCreateFlashcard = (
    front: string,
    back: string,
    subject: SubjectId,
    messageId: string
  ) => {
    setFlashcardPrefill({
      front,
      back,
      subject,
      messageId,
    });
    setIsCreateFlashcardOpen(true);
  };

  const handleSaveFlashcard = (
    newCardData: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'repetition' | 'easeFactor' | 'nextReviewDate' | 'status'>
  ) => {
    const newCard: Flashcard = {
      ...newCardData,
      id: `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      status: 'new',
    };
    setFlashcards((prev) => [newCard, ...prev]);
  };

  const handleUpdateFlashcard = (updated: Flashcard) => {
    setFlashcards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active session object
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist sessions:', e);
    }
  }, [sessions]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to persist bookmarks:', e);
    }
  }, [bookmarks]);

  // Sync language preference
  const handleSelectLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      // ignore
    }
  };

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Start new chat session
  const handleNewChat = (subjectToUse?: SubjectId) => {
    const newSub = subjectToUse || activeSubject;
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Study Chat',
      subject: newSub,
      language: currentLanguage,
      messages: [],
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setActiveSubject(newSub);
  };

  // Select existing session
  const handleSelectSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setActiveSessionId(id);
      setActiveSubject(target.subject);
      setCurrentLanguage(target.language);
    }
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const freshId = `session_${Date.now()}`;
        const fresh: ChatSession = {
          id: freshId,
          title: 'New Study Chat',
          subject: activeSubject,
          language: currentLanguage,
          messages: [],
          updatedAt: Date.now(),
        };
        setActiveSessionId(freshId);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      const freshId = `session_${Date.now()}`;
      const fresh: ChatSession = {
        id: freshId,
        title: 'New Study Chat',
        subject: activeSubject,
        language: currentLanguage,
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions([fresh]);
      setActiveSessionId(freshId);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (msg: Message) => {
    const existing = bookmarks.find((b) => b.messageId === msg.id);

    if (existing) {
      // Remove
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      // Add
      const userQ = msg.userQuestion || 'Study Question';
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        messageId: msg.id,
        question: userQ,
        answer: msg.content,
        subject: msg.subject || activeSubject,
        language: msg.language || currentLanguage,
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  // Update feedback rating
  const handleUpdateFeedback = (messageId: string, feedback: FeedbackData) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: session.messages.map((m) =>
              m.id === messageId ? { ...m, feedback } : m
            ),
          };
        }
        return session;
      })
    );
  };

  // Send message and stream Gemini response
  const handleSendMessage = async (text: string, actionOverride?: 'simpler' | 'practice' | 'quiz') => {
    if (!text.trim() || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `assistant_${Date.now()}`;

    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      subject: activeSubject,
      language: currentLanguage,
    };

    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      subject: activeSubject,
      language: currentLanguage,
      isStreaming: true,
      userQuestion: text,
    };

    // Update session title if first message
    const updatedTitle =
      messages.length === 0
        ? text.slice(0, 45) + (text.length > 45 ? '...' : '')
        : currentSession.title;

    // Append to current session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: updatedTitle,
            subject: activeSubject,
            language: currentLanguage,
            messages: [...s.messages, newUserMessage, newAssistantMessage],
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    // If in active study room, anonymously register the topic
    if (activeStudyRoom) {
      if (studyRoomWsRef.current && studyRoomWsRef.current.readyState === WebSocket.OPEN) {
        studyRoomWsRef.current.send(
          JSON.stringify({
            type: 'log_topic',
            roomCode: activeStudyRoom.code,
            topic: text.slice(0, 80),
            subject: activeSubject,
          })
        );
      } else {
        fetch(`/api/study-rooms/${activeStudyRoom.code}/topic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: text.slice(0, 80),
            subject: activeSubject,
          }),
        }).catch((e) => console.warn('Failed to record topic in study room:', e));
      }
    }

    setIsLoading(true);
    let accumulatedText = '';

    try {
      // Prepare message history for server
      const chatHistory = [...messages, newUserMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call streaming endpoint
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          language: currentLanguage,
          subject: SUBJECTS.find((s) => s.id === activeSubject)?.name || 'General',
          action: actionOverride || 'normal',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed, fallback to standard response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Update assistant message with stream chunk
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === activeSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedText, isStreaming: true }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              }
              if (parsed.done) {
                break;
              }
            } catch (e) {
              // Ignore non-JSON line
            }
          }
        }
      }

      // Mark streaming complete
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, isStreaming: false } : m
              ),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.warn('Streaming error, checking if content was received:', err);

      // If we already received accumulated text, just finalize the message
      if (accumulatedText.trim().length > 0) {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return s;
          })
        );
        return;
      }

      // Fallback to non-streaming POST /api/chat
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            language: currentLanguage,
            subject: SUBJECTS.find((s) => s.id === activeSubject)?.name || 'General',
            action: actionOverride || 'normal',
          }),
        });

        const data = await fallbackRes.json();
        const fallbackContent = data.text || 'Sorry, I could not complete the solution right now. Please try again.';

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: fallbackContent, isStreaming: false }
                    : m
                ),
              };
            }
            return s;
          })
        );
      } catch (fallbackErr: any) {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content:
                          '⚠️ Unable to connect to Kumhud server. Please verify your connection or try again shortly.',
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Open bookmarked solution directly in chat
  const handleOpenBookmarkedInChat = (question: string, answer: string, subj: SubjectId) => {
    setActiveSubject(subj);
    handleNewChat(subj);
    handleSendMessage(`Can you explain more about this problem: "${question}"`);
  };

  const handleRandomQuestion = () => {
    const currentSubjectObj = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];
    const contextPrompts = currentSubjectObj.contextPrompts || [];
    if (contextPrompts.length > 0) {
      const randomPrompt = contextPrompts[Math.floor(Math.random() * contextPrompts.length)];
      handleSendMessage(randomPrompt.prompt[currentLanguage] || randomPrompt.prompt.english);
    } else {
      const prompts =
        currentSubjectObj.samplePrompts[currentLanguage] || currentSubjectObj.samplePrompts.english;
      handleSendMessage(prompts[Math.floor(Math.random() * prompts.length)]);
    }
  };

  // Generate concise session revision summary
  const handleGenerateSummary = async () => {
    if (messages.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          subject: activeSubject,
          language: currentLanguage,
          title: currentSession?.title || 'Study Session',
        }),
      });

      const data = await response.json();
      if (data?.summary) {
        setSummaryText(data.summary);
      }
    } catch (err) {
      console.error('Failed to generate session revision summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleOpenSummary = () => {
    setIsSummaryOpen(true);
    if (!summaryText && messages.length > 0) {
      handleGenerateSummary();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        onNewChat={() => handleNewChat()}
        onOpenHistory={() => {
          setDrawerTab('history');
          setIsDrawerOpen(true);
        }}
        onOpenBookmarks={() => {
          setDrawerTab('bookmarks');
          setIsDrawerOpen(true);
        }}
        onOpenModules={() => setIsModulesOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSummary={handleOpenSummary}
        onOpenStudyRoom={() => setIsStudyRoomOpen(true)}
        isStudyRoomJoined={Boolean(activeStudyRoom)}
        activeRoomParticipantCount={activeStudyRoom?.participantsCount}
        dueFlashcardCount={dueFlashcardCount}
        onDownloadPDF={() => exportChatSessionToPDF(currentSession)}
        hasMessages={messages.length > 0}
        bookmarkCount={bookmarks.length}
      />

      {/* Suggested Subject Bar */}
      <SubjectBar
        activeSubject={activeSubject}
        onSelectSubject={(sub) => setActiveSubject(sub)}
      />

      {/* Chat Messages Body / Welcome State */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeState
            activeSubject={activeSubject}
            onSelectSubject={(sub) => setActiveSubject(sub)}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onOpenModules={() => setIsModulesOpen(true)}
            currentLanguage={currentLanguage}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-2">
            {messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
              const userQuestion =
                msg.role === 'assistant'
                  ? msg.userQuestion || (prevMsg?.role === 'user' ? prevMsg.content : undefined)
                  : undefined;
              const isBookmarked = bookmarks.some((b) => b.messageId === msg.id);

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  userQuestion={userQuestion}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  onUpdateFeedback={handleUpdateFeedback}
                  onQuickAction={(actionPrompt) => handleSendMessage(actionPrompt)}
                  onSaveAsFlashcard={handleOpenCreateFlashcard}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Mobile-first Floating/Sticky Chat Input */}
      <ChatInput
        onSendMessage={(text) => handleSendMessage(text)}
        isLoading={isLoading}
        activeSubject={activeSubject}
        onSelectSubject={(sub) => setActiveSubject(sub)}
        currentLanguage={currentLanguage}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* History & Bookmarks Slide-over Drawer */}
      <HistoryAndBookmarksDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={drawerTab}
        onTabChange={(tab) => setDrawerTab(tab)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        onNewChat={() => handleNewChat()}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onOpenBookmarkedInChat={handleOpenBookmarkedInChat}
      />

      {/* Structured Learning Modules Modal */}
      <LearningModulesModal
        isOpen={isModulesOpen}
        onClose={() => setIsModulesOpen(false)}
        initialSubject={activeSubject}
        onSelectPracticeQuestion={(q, subj) => {
          setActiveSubject(subj);
          handleSendMessage(q);
        }}
      />

      {/* Spaced Repetition Flashcards Deck Modal */}
      <FlashcardsDeckModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        flashcards={flashcards}
        onUpdateCard={handleUpdateFlashcard}
        onDeleteCard={handleDeleteFlashcard}
        onOpenCreateModal={() => {
          setFlashcardPrefill({
            front: '',
            back: '',
            subject: activeSubject,
          });
          setIsCreateFlashcardOpen(true);
        }}
      />

      {/* Quick Create Flashcard Modal */}
      <CreateFlashcardModal
        isOpen={isCreateFlashcardOpen}
        onClose={() => setIsCreateFlashcardOpen(false)}
        onSave={handleSaveFlashcard}
        defaultFront={flashcardPrefill.front}
        defaultBack={flashcardPrefill.back}
        defaultSubject={flashcardPrefill.subject}
        sourceMessageId={flashcardPrefill.messageId}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={() => handleNewChat()}
        onOpenHistory={() => {
          setDrawerTab('history');
          setIsDrawerOpen(true);
        }}
        onOpenBookmarks={() => {
          setDrawerTab('bookmarks');
          setIsDrawerOpen(true);
        }}
        onOpenModules={() => setIsModulesOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenSummary={handleOpenSummary}
        onOpenStudyRoom={() => setIsStudyRoomOpen(true)}
        onDownloadPDF={() => exportChatSessionToPDF(currentSession)}
        hasMessages={messages.length > 0}
        onSelectSubject={(subj) => setActiveSubject(subj)}
        onSelectLanguage={handleSelectLanguage}
        currentLanguage={currentLanguage}
        onRandomQuestion={handleRandomQuestion}
      />

      {/* Session Revision Summary Modal */}
      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summary={summaryText}
        isLoading={isGeneratingSummary}
        onRegenerate={handleGenerateSummary}
        subject={activeSubject}
        language={currentLanguage}
        sessionTitle={currentSession?.title || 'Study Session'}
        onOpenFlashcardCreate={(front, back, subj) => {
          setIsSummaryOpen(false);
          setFlashcardPrefill({
            front,
            back,
            subject: subj,
          });
          setIsCreateFlashcardOpen(true);
        }}
      />

      {/* Virtual Study Room Modal */}
      <VirtualStudyRoomModal
        isOpen={isStudyRoomOpen}
        onClose={() => setIsStudyRoomOpen(false)}
        activeRoom={activeStudyRoom}
        onJoinRoom={handleJoinStudyRoom}
        onCreateRoom={handleCreateStudyRoom}
        onLeaveRoom={handleLeaveStudyRoom}
        onSendReaction={handleSendStudyRoomReaction}
        onAskTopicFromRoom={(topic, subj) => {
          if (subj) setActiveSubject(subj);
          handleSendMessage(topic);
        }}
      />
    </div>
  );
}
