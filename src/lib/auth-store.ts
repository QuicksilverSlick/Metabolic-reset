import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@shared/types';
interface AuthState {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      isAuthenticated: false,
      login: (user) => set({ user, userId: user.id, isAuthenticated: true }),
      logout: () => set({ user: null, userId: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);