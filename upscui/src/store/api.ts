import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Question, AnswerResult, Note, Bookmark, TestResult, SearchFilters,
  GamificationProfile, Badge, XpEvent, LeaderboardEntry, CommunityPost, ActivityResult,
} from '../types';

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
  tagTypes: ['Bookmark', 'Note', 'Community', 'Gamification', 'Leaderboard'],
  endpoints: builder => ({
    // ── Auth ──────────────────────────────────────────────────
    login: builder.mutation<{ success: boolean; token: string; message: string }, { username: string; password: string }>({
      query: body => ({ url: '/login', method: 'POST', body }),
    }),
    register: builder.mutation<{ success: boolean; message: string }, { name: string; username: string; password: string }>({
      query: body => ({ url: '/register', method: 'POST', body }),
    }),

    // ── Questions ─────────────────────────────────────────────
    getNextQuestion: builder.query<Question, void>({ query: () => '/next' }),
    submitAnswer: builder.mutation<AnswerResult, { answer: string }>({
      query: body => ({ url: '/answer', method: 'POST', body }),
    }),
    getQuestions: builder.query<Question[], { subject?: string; topic?: string; difficulty?: string }>({
      query: params => ({ url: '/questions', params }),
    }),
    getSubjects: builder.query<string[], void>({ query: () => '/subjects' }),
    getTopics: builder.query<string[], { subject: string }>({
      query: ({ subject }) => `/topics?subject=${subject}`,
    }),
    getProfile: builder.query<any, void>({ query: () => '/profile' }),
    updateProfile: builder.mutation<any, Partial<{ name: string; targetYear: number }>>({
      query: body => ({ url: '/profile', method: 'PUT', body }),
    }),

    // ── Assessment ────────────────────────────────────────────
    getTestQuestions: builder.query<Question[], { type: string; subject?: string; count: number }>({
      query: params => ({ url: '/test/questions', params }),
    }),
    submitTestResult: builder.mutation<{ id: string }, Omit<TestResult, 'sessionId'>>({
      query: body => ({ url: '/test/submit', method: 'POST', body }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        await queryFulfilled;
        dispatch(upscApi.endpoints.recordActivity.initiate());
      },
    }),
    getTestHistory: builder.query<TestResult[], void>({ query: () => '/test/history' }),
    searchQuestions: builder.query<Question[], SearchFilters>({
      query: params => ({ url: '/search', params }),
    }),
    getBookmarks: builder.query<Bookmark[], void>({
      query: () => '/bookmarks', providesTags: ['Bookmark'],
    }),
    addBookmark: builder.mutation<Bookmark, { questionId: string; note?: string }>({
      query: body => ({ url: '/bookmarks', method: 'POST', body }),
      invalidatesTags: ['Bookmark'],
    }),
    deleteBookmark: builder.mutation<void, string>({
      query: id => ({ url: `/bookmarks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Bookmark'],
    }),
    getNotes: builder.query<Note[], void>({
      query: () => '/notes', providesTags: ['Note'],
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

    // ── Phase 4: Gamification ─────────────────────────────────
    getGamificationProfile: builder.query<GamificationProfile, void>({
      query: () => '/gamification/profile',
      providesTags: ['Gamification'],
    }),
    recordActivity: builder.mutation<ActivityResult, void>({
      query: () => ({ url: '/gamification/activity', method: 'POST' }),
      invalidatesTags: ['Gamification', 'Leaderboard'],
    }),
    getAllBadges: builder.query<Badge[], void>({
      query: () => '/gamification/badges',
      providesTags: ['Gamification'],
    }),
    getXpEvents: builder.query<XpEvent[], void>({ query: () => '/gamification/xp-events' }),

    // ── Phase 4: Leaderboard ──────────────────────────────────
    getGlobalLeaderboard: builder.query<LeaderboardEntry[], void>({
      query: () => '/leaderboard/global',
      providesTags: ['Leaderboard'],
    }),
    getWeeklyLeaderboard: builder.query<LeaderboardEntry[], void>({
      query: () => '/leaderboard/weekly',
      providesTags: ['Leaderboard'],
    }),
    getStateLeaderboard: builder.query<LeaderboardEntry[], { state: string }>({
      query: ({ state }) => `/leaderboard/state?state=${state}`,
      providesTags: ['Leaderboard'],
    }),
    getMyRank: builder.query<LeaderboardEntry, void>({ query: () => '/leaderboard/me' }),

    // ── Phase 4: Community ────────────────────────────────────
    getCommunityFeed: builder.query<CommunityPost[], { page?: number }>({
      query: ({ page = 0 } = {}) => `/community/feed?page=${page}`,
      providesTags: ['Community'],
    }),
    createPost: builder.mutation<CommunityPost, { content: string; post_type?: string }>({
      query: body => ({ url: '/community/post', method: 'POST', body }),
      invalidatesTags: ['Community'],
    }),
    toggleLike: builder.mutation<{ liked: boolean; likes: number }, string>({
      query: id => ({ url: `/community/post/${id}/like`, method: 'POST' }),
      invalidatesTags: ['Community'],
    }),
    inviteFriend: builder.mutation<{ xp: any; message: string }, void>({
      query: () => ({ url: '/community/invite', method: 'POST' }),
      invalidatesTags: ['Gamification', 'Community'],
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
  // Phase 4
  useGetGamificationProfileQuery,
  useRecordActivityMutation,
  useGetAllBadgesQuery,
  useGetXpEventsQuery,
  useGetGlobalLeaderboardQuery,
  useGetWeeklyLeaderboardQuery,
  useGetStateLeaderboardQuery,
  useGetMyRankQuery,
  useGetCommunityFeedQuery,
  useCreatePostMutation,
  useToggleLikeMutation,
  useInviteFriendMutation,
} = upscApi;
