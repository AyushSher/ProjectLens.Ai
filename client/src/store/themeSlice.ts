import { createSlice } from '@reduxjs/toolkit';

// ── Types ─────────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light';

export interface ThemeState {
  theme: Theme;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'projectlens-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialTheme = getInitialTheme();
// Apply immediately so there's no flash on first load
if (typeof window !== 'undefined') applyTheme(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme } as ThemeState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    },
    setTheme(state, action: { payload: Theme }) {
      state.theme = action.payload;
      applyTheme(state.theme);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
