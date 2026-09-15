import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Project, ProjectIntelligenceData } from '../types';

const TOKEN_KEY = 'projectlens-token';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── RTK Query API ─────────────────────────────────────────────────────────────

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/api`,
    prepareHeaders: (headers) => {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    /** GET /api/projects — fetch all projects for the authenticated user */
    fetchProjects: builder.query<ProjectIntelligenceData[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),

    /** POST /api/projects — create a new project */
    createProject: builder.mutation<
      ProjectIntelligenceData & {
        credits?: { freeProjectsRemaining: number; paidCredits: number };
      },
      Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),

    /** PUT /api/projects/:id — save/update a project */
    saveProject: builder.mutation<
      ProjectIntelligenceData,
      {
        projectId: string;
        data: Partial<Omit<ProjectIntelligenceData, 'project'>> & {
          project?: Partial<Project>;
        };
      }
    >({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}`,
        method: 'PUT',
        body: data,
      }),
      // Optimistic update is handled in App.tsx via `upsertProject` dispatch;
      // we only invalidate to sync server truth on success.
      invalidatesTags: ['Project'],
    }),

    /** DELETE /api/projects/:id — delete a project */
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useFetchProjectsQuery,
  useCreateProjectMutation,
  useSaveProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
