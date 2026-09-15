import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectIntelligenceData } from '../types';

// ── State ─────────────────────────────────────────────────────────────────────

export interface ProjectsState {
  projectsData: ProjectIntelligenceData[];
  currentProjectId: string;
  loadError: string | null;
}

const initialState: ProjectsState = {
  projectsData: [],
  currentProjectId: '',
  loadError: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<ProjectIntelligenceData[]>) {
      state.projectsData = action.payload;
      if (!state.currentProjectId && action.payload.length > 0) {
        state.currentProjectId = action.payload[0].project.id;
      }
    },
    setCurrentProject(state, action: PayloadAction<string>) {
      state.currentProjectId = action.payload;
    },
    /** Add a project to the front of the list */
    prependProject(state, action: PayloadAction<ProjectIntelligenceData>) {
      state.projectsData.unshift(action.payload);
      state.currentProjectId = action.payload.project.id;
    },
    /** Replace or insert a project by id */
    upsertProject(state, action: PayloadAction<ProjectIntelligenceData>) {
      const idx = state.projectsData.findIndex(
        (p) => p.project.id === action.payload.project.id
      );
      if (idx >= 0) {
        state.projectsData[idx] = action.payload;
      } else {
        state.projectsData.unshift(action.payload);
      }
    },
    /** Remove a project by id and optionally select the next one */
    removeProject(state, action: PayloadAction<string>) {
      state.projectsData = state.projectsData.filter(
        (p) => p.project.id !== action.payload
      );
      if (state.currentProjectId === action.payload) {
        state.currentProjectId = state.projectsData[0]?.project.id || '';
      }
    },
    setLoadError(state, action: PayloadAction<string | null>) {
      state.loadError = action.payload;
    },
    resetProjects() {
      return initialState;
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  prependProject,
  upsertProject,
  removeProject,
  setLoadError,
  resetProjects,
} = projectsSlice.actions;

export default projectsSlice.reducer;
