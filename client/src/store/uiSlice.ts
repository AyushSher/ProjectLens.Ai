import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RequirementAnalysisResult } from '../types';

// ── State ─────────────────────────────────────────────────────────────────────

export type AppView =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'app';

export interface UiState {
  view: AppView;
  resetToken: string;
  activeTab: string;
  isNewProjectModalOpen: boolean;
  isReportModalOpen: boolean;
  isBuyCreditsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isProjectsLoading: boolean;
  selectedRequirement: RequirementAnalysisResult | null;
}

const initialState: UiState = {
  view: 'landing',
  resetToken: '',
  activeTab: 'dashboard',
  isNewProjectModalOpen: false,
  isReportModalOpen: false,
  isBuyCreditsModalOpen: false,
  isSettingsModalOpen: false,
  isShortcutsModalOpen: false,
  isProjectsLoading: true,
  selectedRequirement: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<AppView>) {
      state.view = action.payload;
    },
    setResetToken(state, action: PayloadAction<string>) {
      state.resetToken = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setNewProjectModalOpen(state, action: PayloadAction<boolean>) {
      state.isNewProjectModalOpen = action.payload;
    },
    setReportModalOpen(state, action: PayloadAction<boolean>) {
      state.isReportModalOpen = action.payload;
    },
    setBuyCreditsModalOpen(state, action: PayloadAction<boolean>) {
      state.isBuyCreditsModalOpen = action.payload;
    },
    setSettingsModalOpen(state, action: PayloadAction<boolean>) {
      state.isSettingsModalOpen = action.payload;
    },
    setShortcutsModalOpen(state, action: PayloadAction<boolean>) {
      state.isShortcutsModalOpen = action.payload;
    },
    setProjectsLoading(state, action: PayloadAction<boolean>) {
      state.isProjectsLoading = action.payload;
    },
    setSelectedRequirement(
      state,
      action: PayloadAction<RequirementAnalysisResult | null>
    ) {
      state.selectedRequirement = action.payload;
    },
    resetUi() {
      return { ...initialState, view: 'landing' as AppView };
    },
  },
});

export const {
  setView,
  setResetToken,
  setActiveTab,
  setNewProjectModalOpen,
  setReportModalOpen,
  setBuyCreditsModalOpen,
  setSettingsModalOpen,
  setShortcutsModalOpen,
  setProjectsLoading,
  setSelectedRequirement,
  resetUi,
} = uiSlice.actions;

export default uiSlice.reducer;
