import { create } from 'zustand';
import { SystemNotification } from '../types';
import { initialNotifications } from '../services/mockData';

interface NotificationState {
  notifications: SystemNotification[];
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: initialNotifications,

  addNotification: (notif) => {
    const newEntry: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    set((state) => ({
      notifications: [newEntry, ...state.notifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
