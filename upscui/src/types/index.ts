export interface User {
  id: string;
  name: string;
  email: string;
  targetYear: number;
}

export interface Question {
  id: string;
  Ques: string;
  Option1: string;
  Option2: string;
  Option3: string;
  Option4: string;
  Option5: string;
  Ans: string;
  subject?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  explanation?: string;
}

export interface AnswerResult {
  correct: boolean;
  your_answer: string;
  correct_answer: string;
  question: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface SettingsState {
  theme: 'light' | 'dark';
  notifications: boolean;
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  QuestionBank: undefined;
  Assessment: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  DailyQuestions: undefined;
  QuestionDetail: { question: Question };
  AnswerResult: { result: AnswerResult; question: Question };
  Explanation: { question: Question; result: AnswerResult };
};

// ── Phase 2: Assessment System Types ─────────────────────────
export type TestType = 'mock' | 'sectional' | 'daily';

export interface TestQuestion extends Question {
  userAnswer?: string;
  timeTaken?: number;
}

export interface TestSession {
  id: string;
  type: TestType;
  subject?: string;
  questions: TestQuestion[];
  currentIndex: number;
  timeLimit: number;
  timeLeft: number;
  started: boolean;
  submitted: boolean;
  startedAt?: string;
}

export interface TestResult {
  sessionId: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  timeTaken: number;
  subjectBreakdown: Record<string, { correct: number; total: number }>;
}

export interface Bookmark {
  id: string;
  questionId: string;
  question: Question;
  note?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query: string;
  subject?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: 'question' | 'topic' | 'pyq';
}

export type TestStackParamList = {
  TestHome: undefined;
  MockTest: { type: TestType; subject?: string; questionCount: number; timeLimit: number };
  TestEngine: undefined;
  TestResult: { result: TestResult };
};

export type AssessmentTabParamList = {
  Tests: undefined;
  Search: undefined;
  Bookmarks: undefined;
  Notes: undefined;
};

// ── Phase 4: Gamification & Community Types ──────────────────

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  xp_reward: number;
  criteria: { type: string; threshold: number };
  earned: boolean;
}

export interface GamificationProfile {
  total_xp: number;
  level: number;
  next_level_xp: number;
  current_streak: number;
  longest_streak: number;
  badges: Badge[];
  badge_count: number;
}

export interface XpEvent {
  id: string;
  event_type: string;
  xp_awarded: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  xp_this_week: number;
  rank: number;
  state?: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  username: string;
  post_type: 'achievement' | 'milestone' | 'invite' | 'general';
  content: string;
  metadata: Record<string, any>;
  likes: number;
  liked_by_me: boolean;
  created_at: string;
}

export interface ActivityResult {
  xp: { xp_awarded: number; total_xp: number; level: number; leveled_up: boolean };
  streak: { current: number; longest: number; last_activity: string };
  new_badges: Badge[];
}

export type GamificationTabParamList = {
  Leaderboard: undefined;
  Badges: undefined;
  Community: undefined;
};
