import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationsReducer from './notificationsSlice';
import projectsReducer from './projectsSlice';
import uiReducer from './uiSlice';
import themeReducer from './themeSlice';
import { projectsApi } from './projectsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    projects: projectsReducer,
    ui: uiReducer,
    theme: themeReducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectsApi.middleware),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
