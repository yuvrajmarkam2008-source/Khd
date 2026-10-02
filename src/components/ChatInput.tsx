import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, ChevronDown, Check, AlertCircle, X } from 'lucide-react';
import { SubjectId, Language } from '../types';
import { SUBJECTS } from '../data/subjects';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
  currentLanguage: Language;
  onOpenCommandPalette?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  activeSubject,
  onSelectSubject,
  currentLanguage,
  onOpenCommandPalette,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>(() => {
    return currentLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
  });
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);

  // Sync speech language when global language preference changes
  useEffect(() => {
    if (currentLanguage === 'hindi') {
      setSpeechLang('hi-IN');
    } else {
      setSpeechLang('en-IN');
    }
  }, [currentLanguage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcript + ' ';
          } else {
            interimStr += transcript;
          }
        }

        if (finalStr) {
          setInputText((prev) => (prev ? `${prev.trim()} ${finalStr.trim()}` : finalStr.trim()));
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone access denied. Please allow microphone permissions in your browser.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal timeout if student paused speaking; don't terminate abruptly unless manual
        } else if (event.error === 'network') {
          setSpeechError('Speech recognition network error. Please check your connection.');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If still listening and wasn't manually stopped, try to keep listening for student's voice
        if (!isManuallyStoppedRef.current && isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to initialize SpeechRecognition:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || !recognitionRef.current) {
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari, or type your question.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      isManuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      setInterimTranscript('');
    } else {
      isManuallyStoppedRef.current = false;
      setSpeechError(null);
      setInterimTranscript('');
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.lang = speechLang;
            recognitionRef.current.start();
          }, 200);
        } catch (err) {
          setIsListening(false);
        }
      }
    }
  };

  const handleStopMicAndSend = () => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');

    // If there is text, send it
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + K or Cmd + K opens Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      onOpenCommandPalette?.();
      return;
    }

    // Ctrl + Enter or Cmd + Enter immediately sends
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Standard Enter without Shift sends
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const combined = `${inputText} ${interimTranscript}`.trim();
    if (!combined || isLoading) return;
    onSendMessage(combined);
    setInputText('');
    setInterimTranscript('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const currentSubjectObj = SUBJECTS.find((s) => s.id === activeSubject);

  const getPlaceholder = () => {
    if (isListening) {
      return 'Listening... speak clearly now...';
    }
    if (currentLanguage === 'hindi') {
      return `कुम्हूद से ${currentSubjectObj?.name || 'विषय'} से जुड़ा कोई भी प्रश्न पूछें... (उदा. द्विघात समीकरण कैसे हल करें?)`;
    } else if (currentLanguage === 'hinglish') {
      return `Kumhud se ${currentSubjectObj?.name || 'subject'} ka doubt pucho... (e.g., Photosynthesis ke steps explain karo)`;
    }
    return `Ask Kumhud any question in ${currentSubjectObj?.name || 'your subject'}... (e.g., Solve 2x² - 7x + 3 = 0 step by step)`;
  };

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Error notification for speech */}
        {speechError && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="p-1 rounded-md text-rose-400 hover:text-rose-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Speech Recognition Banner when Listening */}
        {isListening && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-indigo-500/10 to-violet-500/10 border-2 border-rose-400 dark:border-rose-600 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-rose-600 relative" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Listening to your voice...
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    {speechLang === 'hi-IN' ? 'हिंदी (hi-IN)' : 'English/Hinglish (en-IN)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {interimTranscript ? (
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 italic">
                      "{interimTranscript}"
                    </span>
                  ) : (
                    'Speak your math, science, or study doubt clearly into your microphone'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* Language toggle for speech */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = speechLang === 'hi-IN' ? 'en-IN' : 'hi-IN';
                  setSpeechLang(nextLang);
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.lang = nextLang;
                    } catch (e) {
                      // ignore
                    }
                  }
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                title="Switch voice language between Hindi and English"
              >
                {speechLang === 'hi-IN' ? 'Switch to English' : 'Switch to हिंदी'}
              </button>

              {/* Stop & Ask button */}
              <button
                type="button"
                onClick={handleStopMicAndSend}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done & Ask</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMic}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Cancel Voice Input"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Context Selector Pill & Helper */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <span>{currentSubjectObj?.icon}</span>
              <span>{currentSubjectObj?.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSubjectMenu && (
              <div className="absolute bottom-full mb-1 left-0 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 min-w-[160px] space-y-0.5 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Select Subject
                </span>
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSelectSubject(sub.id);
                      setShowSubjectMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      activeSubject === sub.id
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">Enter</kbd> to ask, or click 🎙️ to speak
          </div>
        </div>

        {/* Input Control Box */}
        <div
          className={`relative flex items-end gap-2 rounded-2xl border p-2 shadow-xs transition-all ${
            isListening
              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20'
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
          }`}
        >
          <div className="flex-1 flex flex-col">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="w-full bg-transparent border-0 resize-none outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 p-1.5 min-h-[36px] max-h-[140px] leading-relaxed"
            />
            {interimTranscript && (
              <div className="px-1.5 pb-1 text-xs text-indigo-600 dark:text-indigo-400 italic">
                ...{interimTranscript}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {/* Speech to text mic button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-2 rounded-xl transition-all relative ${
                isListening
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
              title={
                isListening
                  ? 'Listening... Click to stop voice input'
                  : 'Speak question using Web Speech API (Hindi / English)'
              }
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Ask Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!inputText.trim() && !interimTranscript.trim()) || isLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              title="Ask Kumhud"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Solving...</span>
                </>
              ) : (
                <>
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shortcuts & Educational Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5 px-1">
          <div className="flex items-center gap-2">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Open Command Palette (Ctrl + K)"
              >
                <kbd className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                  Ctrl + K
                </kbd>
                <span>Commands</span>
              </button>
            )}
            <span className="hidden sm:inline-block">•</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                Ctrl + Enter
              </kbd>
              <span>to send</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-right">
            Always verify answers with your teacher or textbook.
          </p>
        </div>
      </div>
    </div>
  );
};
