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
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  DailyQuestions: undefined;
  QuestionDetail: { question: Question };
  AnswerResult: { result: AnswerResult; question: Question };
  Explanation: { question: Question; result: AnswerResult };
};
