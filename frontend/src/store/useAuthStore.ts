import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  sessionTimeoutMinutes: number;
  lastActiveTime: number;
  activeRole: UserRole;
  userPasswordHash?: string;
  login: (user: User) => void;
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (password: string) => boolean;
  switchRole: (role: UserRole) => void;
  updateUser: (updated: Partial<User>) => void;
  updatePassword: (password: string) => void;
  touchSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLocked: false,
      sessionTimeoutMinutes: 30,
      lastActiveTime: Date.now(),
      activeRole: 'super_admin',
      userPasswordHash: 'password321',

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLocked: false,
          activeRole: user.role,
          lastActiveTime: Date.now(),
        });
      },

      logout: () => {
        try {
          localStorage.removeItem('frec_auth_storage');
        } catch (e) {
          // Ignore
        }
        set({
          user: null,
          isAuthenticated: false,
          isLocked: false,
        });
      },

      lockScreen: () => {
        set({ isLocked: true });
      },

      unlockScreen: (password: string) => {
        if (password.length >= 4) {
          set({ isLocked: false, lastActiveTime: Date.now() });
          return true;
        }
        return false;
      },

      switchRole: (role: UserRole) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, role };
          set({ activeRole: role, user: updated });
        } else {
          set({ activeRole: role });
        }
      },

      updateUser: (updated: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updated } });
        }
      },

      updatePassword: (password: string) => {
        set({ userPasswordHash: password });
      },

      touchSession: () => {
        set({ lastActiveTime: Date.now() });
      },
    }),
    {
      name: 'frec_auth_storage',
    }
  )
);
