import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string (Date is not serializable in Redux)
  read: boolean;
  tab?: string;
}

export interface NotificationsState {
  items: AppNotification[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] } as NotificationsState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Omit<AppNotification, 'id' | 'timestamp' | 'read'>>
    ) {
      state.items.unshift({
        ...action.payload,
        id: genId(),
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
    },
    clearAll(state) {
      state.items = [];
    },
  },
});

export const { addNotification, markRead, markAllRead, clearAll } = notificationsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectUnreadCount = (state: RootState) =>
  state.notifications.items.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
