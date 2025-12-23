import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@shared/types';

interface ImpersonationState {
  isImpersonating: boolean;
  impersonatedUser: User | null;
  impersonationSessionId: string | null;
  originalUser: User | null;
  startedAt: number | null;   // When impersonation started (for timeout tracking)
  expiresAt: number | null;   // When impersonation expires (60 min from start)
}

interface AuthState {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  // Impersonation state
  impersonation: ImpersonationState;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  // Impersonation actions
  startImpersonation: (impersonatedUser: User, sessionId: string) => void;
  endImpersonation: () => void;
}
const defaultImpersonation: ImpersonationState = {
  isImpersonating: false,
  impersonatedUser: null,
  impersonationSessionId: null,
  originalUser: null,
  startedAt: null,
  expiresAt: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      isAuthenticated: false,
      impersonation: defaultImpersonation,
      login: (user) => set({ user, userId: user.id, isAuthenticated: true }),
      logout: () => set({ user: null, userId: null, isAuthenticated: false, impersonation: defaultImpersonation }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      // Start impersonating a user (admin only, view-only mode)
      // Sessions auto-expire after 60 minutes for security
      startImpersonation: (impersonatedUser, sessionId) => set((state) => {
        const now = Date.now();
        const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 60 minutes
        return {
          impersonation: {
            isImpersonating: true,
            impersonatedUser,
            impersonationSessionId: sessionId,
            originalUser: state.user, // Store the admin's user for later
            startedAt: now,
            expiresAt: now + IMPERSONATION_DURATION_MS,
          }
        };
      }),
      // End impersonation and restore admin view
      endImpersonation: () => set(() => ({
        impersonation: defaultImpersonation,
      })),
    }),
    {
      name: 'auth-storage',
      // Persist impersonation state so it survives navigation
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        impersonation: state.impersonation,
      }),
    }
  )
);