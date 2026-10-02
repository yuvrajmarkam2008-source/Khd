export type Language = 'english' | 'hindi' | 'hinglish';

export type SubjectId =
  | 'maths'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'computerscience';

export interface StarterPrompt {
  category: string;
  categoryHindi?: string;
  tag: string;
  icon?: string;
  prompt: {
    english: string;
    hindi: string;
    hinglish: string;
  };
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  hindiName: string;
  icon: string;
  color: string;
  lightBg: string;
  borderColor: string;
  tagline: string;
  samplePrompts: {
    english: string[];
    hindi: string[];
    hinglish: string[];
  };
  contextPrompts?: StarterPrompt[];
}

export interface FeedbackData {
  rating: 'up' | 'down';
  comment?: string;
  accuracyRating?: number; // 1-5
  clarityRating?: number; // 1-5
  submittedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  subject?: SubjectId;
  language?: Language;
  isStreaming?: boolean;
  userQuestion?: string;
  feedback?: FeedbackData;
  isBookmarked?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: SubjectId;
  language: Language;
  messages: Message[];
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  messageId: string;
  question: string;
  answer: string;
  subject: SubjectId;
  language: Language;
  createdAt: number;
  note?: string;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  subject: SubjectId;
  front: string; // Concept, term, formula, or question
  back: string; // Answer, explanation, derivation
  sourceQuestion?: string;
  sourceMessageId?: string;
  createdAt: number;
  interval: number; // In days
  repetition: number;
  easeFactor: number;
  nextReviewDate: number;
  lastReviewedAt?: number;
  status: 'new' | 'learning' | 'mastered';
}

export interface FeedbackPayload {
  messageId: string;
  question?: string;
  answer: string;
  rating: 'up' | 'down';
  comment?: string;
  accuracyRating?: number;
  clarityRating?: number;
  subject?: string;
  language?: string;
  timestamp: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  hint?: string;
  stepByStepSolution: string;
  finalAnswer: string;
}

export interface LearningModule {
  id: string;
  subject: SubjectId;
  title: string;
  hindiTitle?: string;
  overview: string;
  keyConcepts: {
    title: string;
    description: string;
    formulaOrRule?: string;
  }[];
  practiceQuestions: PracticeQuestion[];
}

export interface AnonymousParticipant {
  id: string;
  pseudonym: string;
  avatar: string;
  subject: SubjectId;
  joinedAt: number;
}

export interface TopicStat {
  topic: string;
  count: number;
  subject: SubjectId;
  lastAskedAt: number;
}

export interface RoomActivity {
  id: string;
  type: 'question' | 'reaction' | 'join' | 'streak';
  text: string;
  subject?: SubjectId;
  avatar?: string;
  timestamp: number;
}

export interface StudyRoom {
  code: string;
  name: string;
  subject: SubjectId | 'all';
  createdByPseudonym: string;
  createdAt: number;
  participantsCount: number;
  topicsStats: TopicStat[];
  recentActivities: RoomActivity[];
  activeSprintSecondsRemaining: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceTopic?: string;
}

export interface RetentionQuiz {
  id: string;
  title: string;
  subject: SubjectId;
  language: Language;
  questions: QuizQuestion[];
  createdAt: number;
}
