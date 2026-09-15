/**
 * NotificationContext — backward-compatible shim on top of Redux notificationsSlice.
 *
 * All existing components that call `useNotifications()` continue to work unchanged.
 * Note: `timestamp` is stored as an ISO string in Redux (Date is not serializable).
 * The context converts it back to a Date when exposing to consumers.
 */
import React, { createContext, useCallback, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addNotification as addNotificationAction,
  markRead as markReadAction,
  markAllRead as markAllReadAction,
  clearAll as clearAllAction,
  selectUnreadCount,
} from '../store/notificationsSlice';

// ── Public types (unchanged) ──────────────────────────────────────────────────

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;  // exposed as Date (converted from ISO string stored in Redux)
  read: boolean;
  tab?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const rawItems = useAppSelector((s) => s.notifications.items);
  const unreadCount = useAppSelector(selectUnreadCount);

  // Convert ISO strings → Date for consumers
  const notifications: AppNotification[] = rawItems.map((n) => ({
    ...n,
    timestamp: new Date(n.timestamp),
  }));

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      dispatch(addNotificationAction(n));
    },
    [dispatch]
  );

  const markRead = useCallback(
    (id: string) => dispatch(markReadAction(id)),
    [dispatch]
  );

  const markAllRead = useCallback(() => dispatch(markAllReadAction()), [dispatch]);

  const clearAll = useCallback(() => dispatch(clearAllAction()), [dispatch]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ── Hook (unchanged public API) ───────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
