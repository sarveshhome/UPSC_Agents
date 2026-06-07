import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Question, AnswerResult } from '../types';

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
} = upscApi;
