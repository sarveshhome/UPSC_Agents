import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Question, AnswerResult, Note, Bookmark, TestResult, SearchFilters } from '../types';

const BASE_URL = 'http://localhost:8000';

export const upscApi = createApi({
  reducerPath: 'upscApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Bookmark', 'Note'],
  endpoints: builder => ({
    login: builder.mutation<{ success: boolean; token: string; message: string }, { username: string; password: string }>({
      query: body => ({ url: '/login', method: 'POST', body }),
    }),
    register: builder.mutation<{ success: boolean; message: string }, { name: string; username: string; password: string }>({
      query: body => ({ url: '/register', method: 'POST', body }),
    }),
    getNextQuestion: builder.query<Question, void>({
      query: () => '/next',
    }),
    submitAnswer: builder.mutation<AnswerResult, { answer: string }>({
      query: body => ({ url: '/answer', method: 'POST', body }),
    }),
    getQuestions: builder.query<Question[], { subject?: string; topic?: string; difficulty?: string }>({
      query: params => ({ url: '/questions', params }),
    }),
    getSubjects: builder.query<string[], void>({
      query: () => '/subjects',
    }),
    getTopics: builder.query<string[], { subject: string }>({
      query: ({ subject }) => `/topics?subject=${subject}`,
    }),
    getProfile: builder.query<any, void>({ query: () => '/profile' }),
    updateProfile: builder.mutation<any, Partial<{ name: string; targetYear: number }>>({
      query: body => ({ url: '/profile', method: 'PUT', body }),
    }),
    // ── Assessment: Test ──────────────────────────────────
    getTestQuestions: builder.query<Question[], { type: string; subject?: string; count: number }>({
      query: params => ({ url: '/test/questions', params }),
    }),
    submitTestResult: builder.mutation<{ id: string }, Omit<TestResult, 'sessionId'>>({
      query: body => ({ url: '/test/submit', method: 'POST', body }),
    }),
    getTestHistory: builder.query<TestResult[], void>({
      query: () => '/test/history',
    }),
    // ── Assessment: Search ────────────────────────────────
    searchQuestions: builder.query<Question[], SearchFilters>({
      query: params => ({ url: '/search', params }),
    }),
    // ── Assessment: Bookmarks ─────────────────────────────
    getBookmarks: builder.query<Bookmark[], void>({
      query: () => '/bookmarks',
      providesTags: ['Bookmark'],
    }),
    addBookmark: builder.mutation<Bookmark, { questionId: string; note?: string }>({
      query: body => ({ url: '/bookmarks', method: 'POST', body }),
      invalidatesTags: ['Bookmark'],
    }),
    deleteBookmark: builder.mutation<void, string>({
      query: id => ({ url: `/bookmarks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Bookmark'],
    }),
    // ── Assessment: Notes ─────────────────────────────────
    getNotes: builder.query<Note[], void>({
      query: () => '/notes',
      providesTags: ['Note'],
    }),
    createNote: builder.mutation<Note, Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>({
      query: body => ({ url: '/notes', method: 'POST', body }),
      invalidatesTags: ['Note'],
    }),
    updateNote: builder.mutation<Note, Partial<Note> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/notes/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Note'],
    }),
    deleteNote: builder.mutation<void, string>({
      query: id => ({ url: `/notes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Note'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetNextQuestionQuery,
  useSubmitAnswerMutation,
  useGetQuestionsQuery,
  useGetSubjectsQuery,
  useGetTopicsQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetTestQuestionsQuery,
  useSubmitTestResultMutation,
  useGetTestHistoryQuery,
  useSearchQuestionsQuery,
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useDeleteBookmarkMutation,
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = upscApi;
