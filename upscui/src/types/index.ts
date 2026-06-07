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
