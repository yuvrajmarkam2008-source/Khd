import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Radio,
  Timer,
  BookOpen,
  MessageSquare,
  Flame,
  Send,
  HelpCircle,
  Hash,
  Share2,
} from 'lucide-react';
import { StudyRoom, SubjectId, RoomActivity } from '../types';
import { SUBJECTS } from '../data/subjects';

interface VirtualStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: StudyRoom | null;
  onJoinRoom: (roomCode: string, pseudonym: string, avatar: string) => Promise<boolean>;
  onCreateRoom: (name: string, subject: SubjectId | 'all', pseudonym: string) => Promise<string | null>;
  onLeaveRoom: () => void;
  onSendReaction: (emoji: string) => void;
  onAskTopicFromRoom: (topic: string, subject?: SubjectId) => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🦉', label: 'Scholar Owl' },
  { emoji: '🚀', label: 'Cosmic Voyager' },
  { emoji: '⚛️', label: 'Quantum Thinker' },
  { emoji: '🧬', label: 'Bio Explorer' },
  { emoji: '📐', label: 'Math Maven' },
  { emoji: '⚡', label: 'Sprint Dynamo' },
  { emoji: '🌟', label: 'Star Student' },
  { emoji: '🦊', label: 'Clever Fox' },
];

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'On Fire' },
  { emoji: '💡', label: 'Eureka!' },
  { emoji: '🚀', label: 'Focus Sprint' },
  { emoji: '👏', label: 'Keep Going!' },
  { emoji: '📚', label: 'Exam Ready' },
];

export const VirtualStudyRoomModal: React.FC<VirtualStudyRoomModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onJoinRoom,
  onCreateRoom,
  onLeaveRoom,
  onSendReaction,
  onAskTopicFromRoom,
}) => {
  // Lobby State
  const [publicRooms, setPublicRooms] = useState<StudyRoom[]>([]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // User Profile in Room
  const [selectedAvatar, setSelectedAvatar] = useState('🦉');
  const [pseudonym, setPseudonym] = useState(() => {
    try {
      const saved = localStorage.getItem('kumhud_study_pseudonym');
      if (saved) return saved;
    } catch (e) {}
    const randomAnimal = ['Owl', 'Fox', 'Eagle', 'Falcon', 'Phoenix', 'Dolphin', 'Lion'][
      Math.floor(Math.random() * 7)
    ];
    return `Curious ${randomAnimal}`;
  });

  // Create Room State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState<SubjectId | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'topics' | 'activities' | 'peers'>('topics');

  // Floating Reaction Animation
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string }[]>([]);

  // Load public lobbies
  const fetchPublicRooms = async () => {
    try {
      const res = await fetch('/api/study-rooms');
      const data = await res.json();
      if (data?.rooms) {
        setPublicRooms(data.rooms);
      }
    } catch (e) {
      console.error('Failed to fetch study rooms:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublicRooms();
      setJoinError(null);
    }
  }, [isOpen, activeRoom]);

  // Save pseudonym
  const handlePseudonymChange = (val: string) => {
    setPseudonym(val);
    try {
      localStorage.setItem('kumhud_study_pseudonym', val);
    } catch (e) {}
  };

  const handleJoinByCode = async (code: string) => {
    if (!code.trim()) {
      setJoinError('Please enter a room code.');
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    const success = await onJoinRoom(code.trim().toUpperCase(), pseudonym, selectedAvatar);
    setIsJoining(false);
    if (!success) {
      setJoinError('Room not found. Check the code or create a new room.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsJoining(true);
    const code = await onCreateRoom(newRoomName, newRoomSubject, pseudonym);
    setIsJoining(false);
    if (code) {
      setShowCreateForm(false);
      setNewRoomName('');
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const triggerReaction = (emoji: string) => {
    onSendReaction(emoji);
    const id = `float_${Date.now()}_${Math.random()}`;
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[760px] text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Virtual Study Room
                </h3>
                {activeRoom ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE IN LOBBY
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Collaborative Learning
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeRoom
                  ? `Studying together anonymously in ${activeRoom.name}`
                  : 'Join peers to see collective topics, doubt trends & study streaks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeRoom && (
              <button
                type="button"
                onClick={onLeaveRoom}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Leave Study Room"
              >
                Leave Room
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

        {/* Content View: Active Room vs Lobby Selection */}
        {activeRoom ? (
          /* ================= ACTIVE ROOM VIEW ================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Room Banner & Live Peer Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-pink-50 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-pink-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {activeRoom.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {activeRoom.subject}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <strong className="text-slate-900 dark:text-white">{activeRoom.participantsCount}</strong> active learners
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    <span>Focus Sprint: </span>
                    <strong className="text-slate-900 dark:text-white">
                      {Math.floor((activeRoom.activeSprintSecondsRemaining || 1500) / 60)}m left
                    </strong>
                  </span>
                </div>
              </div>

              {/* Room Code Badge with Copy */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {activeRoom.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Copy Room Code to Invite Classmates"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Motivational Reactions Floating Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
                  Cheer room:
                </span>
                <div className="flex items-center gap-1">
                  {REACTION_EMOJIS.map((rec) => (
                    <button
                      key={rec.emoji}
                      type="button"
                      onClick={() => triggerReaction(rec.emoji)}
                      className="px-2.5 py-1 text-sm bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg active:scale-90 transition-all shadow-2xs"
                      title={rec.label}
                    >
                      {rec.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Studying as:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedAvatar} {pseudonym}
                </span>
              </div>

              {/* Floating animated reactions */}
              {floatingReactions.map((f) => (
                <div
                  key={f.id}
                  className="absolute bottom-2 right-12 text-2xl animate-bounce pointer-events-none"
                >
                  {f.emoji}
                </div>
              ))}
            </div>

            {/* Navigation Tabs inside Room */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('topics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'topics'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Most Asked Topics ({activeRoom.topicsStats.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'activities'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Activity Stream</span>
              </button>
            </div>

            {/* Tab 1: Collective Topics Leaderboard */}
            {activeTab === 'topics' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Anonymous collective doubt frequency in this subject</span>
                  <span>Click topic to ask Kumhud</span>
                </div>

                {activeRoom.topicsStats.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Sparkles className="w-8 h-8 mx-auto opacity-40 text-indigo-500" />
                    <p className="text-xs font-medium">No topics asked yet in this room.</p>
                    <p className="text-[11px] text-slate-500">
                      Ask your first question in Kumhud chat to populate real-time collective stats!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeRoom.topicsStats.map((stat, idx) => {
                      const maxCount = Math.max(...activeRoom.topicsStats.map((s) => s.count), 1);
                      const percent = Math.min(100, Math.round((stat.count / maxCount) * 100));

                      return (
                        <div
                          key={stat.topic}
                          onClick={() => {
                            onAskTopicFromRoom(`Explain the concept and steps for: ${stat.topic}`, stat.subject);
                            onClose();
                          }}
                          className="group p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden"
                          title="Click to ask Kumhud about this trending topic"
                        >
                          {/* Relative background bar */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-indigo-500/10 dark:bg-indigo-500/15 pointer-events-none transition-all"
                            style={{ width: `${percent}%` }}
                          />

                          <div className="flex items-center justify-between gap-3 relative z-10">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {stat.topic}
                                </h5>
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  {stat.subject}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {stat.count} {stat.count === 1 ? 'doubt' : 'doubts'}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live Activity Stream */}
            {activeTab === 'activities' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Real-time anonymous stream of doubts and study progress
                </p>

                {activeRoom.recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No recent activity.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                    {activeRoom.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none">{act.avatar || '🎓'}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {act.text}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {Math.round((Date.now() - act.timestamp) / 60000)}m ago
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================= LOBBY & JOIN VIEW ================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Anonymous Student Identity Setup */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Your Anonymous Study Persona
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  100% Privacy Protected
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(av.emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                        selectedAvatar === av.emoji
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={pseudonym}
                    onChange={(e) => handlePseudonymChange(e.target.value)}
                    placeholder="Enter study pseudonym..."
                    maxLength={25}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Join by Code Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Join a Room via Unique Code
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. BOARD-2026 or ROOM-1024"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm font-mono uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinByCode(roomCodeInput)}
                  disabled={!roomCodeInput.trim() || isJoining}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
              {joinError && <p className="text-xs text-rose-500">{joinError}</p>}
            </div>

            {/* Create Room Form Toggle */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create a New Custom Study Room</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreateSubmit}
                  className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Create New Study Room
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Room Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="e.g. CBSE 12th Calculus Sprint"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Subject Focus
                      </label>
                      <select
                        value={newRoomSubject}
                        onChange={(e) => setNewRoomSubject(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">All Subjects (General)</option>
                        {SUBJECTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isJoining || !newRoomName.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                  >
                    Generate Unique Room Code & Start
                  </button>
                </form>
              )}
            </div>

            {/* Featured Community Study Lobbies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Featured Community Study Lobbies
                </h4>
                <span className="text-[11px] text-slate-400">Click to join instantly</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publicRooms.map((room) => (
                  <div
                    key={room.code}
                    onClick={() => handleJoinByCode(room.code)}
                    className="group p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {room.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {room.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {room.participantsCount} peers studying
                      </span>
                      <span className="uppercase text-[10px] font-bold text-slate-400">
                        {room.subject}
                      </span>
                    </div>

                    {room.topicsStats.length > 0 && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        🔥 Top: <strong>{room.topicsStats[0].topic}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
