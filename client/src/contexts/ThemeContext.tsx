/**
 * ThemeContext — backward-compatible shim on top of Redux themeSlice.
 *
 * All existing components that call `useTheme()` continue to work unchanged.
 * The actual theme value, localStorage sync, and DOM attribute updates are
 * all handled inside themeSlice.ts.
 */
import React, { createContext, useCallback, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme as toggleThemeAction } from '../store/themeSlice';

// ── Public interface (unchanged) ──────────────────────────────────────────────

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);

  const toggleTheme = useCallback(() => {
    dispatch(toggleThemeAction());
  }, [dispatch]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ── Hook (unchanged public API) ───────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
