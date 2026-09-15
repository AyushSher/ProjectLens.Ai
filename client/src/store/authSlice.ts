import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, getMeApi, signInApi, signUpApi } from '../services/authApi';

const TOKEN_KEY = 'projectlens-token';

// ── State ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true, // true until session restore completes
};

// ── Thunks ───────────────────────────────────────────────────────────────────

/** On app mount: attempt to restore session from localStorage */
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const stored = window.localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;
  const { user } = await getMeApi(stored);
  return { token: stored, user };
});

export const signInThunk = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { token, user } = await signInApi(email, password);
    return { token, user };
  }
);

export const signUpThunk = createAsyncThunk(
  'auth/signUp',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const { token, user } = await signUpApi(name, email, password);
    return { token, user };
  }
);

export const loginWithTokenThunk = createAsyncThunk(
  'auth/loginWithToken',
  async (token: string) => {
    const { user } = await getMeApi(token);
    return { token, user };
  }
);

export const refreshCreditsThunk = createAsyncThunk(
  'auth/refreshCredits',
  async (_, { getState }) => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    const { user } = await getMeApi(stored);
    return user;
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut(state) {
      window.localStorage.removeItem(TOKEN_KEY);
      state.user = null;
      state.token = null;
    },
    deductCredit(state, action: PayloadAction<'free' | 'paid'>) {
      if (!state.user) return;
      if (action.payload === 'free') {
        state.user.freeProjectsRemaining = Math.max(0, state.user.freeProjectsRemaining - 1);
      } else {
        state.user.paidCredits = Math.max(0, state.user.paidCredits - 1);
      }
    },
    addPaidCredits(state, action: PayloadAction<number>) {
      if (!state.user) return;
      state.user.paidCredits = state.user.paidCredits + action.payload;
    },
  },
  extraReducers: (builder) => {
    // restoreSession
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          window.localStorage.setItem(TOKEN_KEY, action.payload.token);
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        window.localStorage.removeItem(TOKEN_KEY);
        state.isLoading = false;
      });

    // signIn / signUp / loginWithToken — all follow the same pattern
    const persistAuth = (
      state: AuthState,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      window.localStorage.setItem(TOKEN_KEY, action.payload.token);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = false;
    };

    builder
      .addCase(signInThunk.fulfilled, persistAuth)
      .addCase(signUpThunk.fulfilled, persistAuth)
      .addCase(loginWithTokenThunk.fulfilled, persistAuth);

    // refreshCredits
    builder.addCase(refreshCreditsThunk.fulfilled, (state, action) => {
      if (action.payload) state.user = action.payload;
    });
  },
});

export const { signOut, deductCredit, addPaidCredits } = authSlice.actions;
export default authSlice.reducer;
