import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Platform } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  platforms: Platform[];
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setPlatforms: (platforms: Platform[]) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      platforms: [],
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      setPlatforms: (platforms) => {
        set({ platforms });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors
        }
        localStorage.removeItem('accessToken');
        set({
          user: null,
          platforms: [],
          accessToken: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const data = await authApi.getMe();
          set({
            user: data.user,
            platforms: data.platforms,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          set({
            user: null,
            platforms: [],
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
);
