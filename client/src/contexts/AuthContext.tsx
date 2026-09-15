/**
 * AuthContext — backward-compatible shim on top of Redux authSlice.
 *
 * All existing components that call `useAuth()` continue to work unchanged.
 * Internally, state is now managed by Redux so it's visible in DevTools and
 * shared across the whole component tree without prop-drilling.
 */
import React, { createContext, useCallback, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  signInThunk,
  signUpThunk,
  signOut as signOutAction,
  loginWithTokenThunk,
  refreshCreditsThunk,
  deductCredit as deductCreditAction,
  addPaidCredits as addPaidCreditsAction,
} from '../store/authSlice';
import type { AuthUser } from '../services/authApi';

// ── Public interface (unchanged) ──────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshCredits: () => Promise<void>;
  deductCredit: (type: 'free' | 'paid') => void;
  addPaidCredits: (count: number) => void;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((s) => s.auth);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await dispatch(signInThunk({ email, password })).unwrap();
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await dispatch(signUpThunk({ name, email, password })).unwrap();
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(signOutAction());
  }, [dispatch]);

  const refreshCredits = useCallback(async () => {
    await dispatch(refreshCreditsThunk()).unwrap();
  }, [dispatch]);

  const deductCredit = useCallback(
    (type: 'free' | 'paid') => {
      dispatch(deductCreditAction(type));
    },
    [dispatch]
  );

  const addPaidCredits = useCallback(
    (count: number) => {
      dispatch(addPaidCreditsAction(count));
    },
    [dispatch]
  );

  const loginWithToken = useCallback(
    async (t: string) => {
      await dispatch(loginWithTokenThunk(t)).unwrap();
    },
    [dispatch]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshCredits,
        deductCredit,
        addPaidCredits,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook (unchanged public API) ───────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
