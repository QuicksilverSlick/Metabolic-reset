import { create } from 'zustand';
export type UserRole = 'challenger' | 'coach' | null;
export interface UserState {
  name: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
  teamName: string | null;
}
export interface HabitsState {
  water: boolean;
  steps: boolean;
  sleep: boolean;
  lesson: boolean;
}
export interface BiometricsState {
  submittedThisWeek: boolean;
  lastSubmissionDate: string | null;
}
interface MockStore {
  user: UserState;
  habits: HabitsState;
  biometrics: BiometricsState;
  points: number;
  // Actions
  login: (name: string, role: UserRole) => void;
  logout: () => void;
  toggleHabit: (habit: keyof HabitsState) => void;
  submitBiometrics: () => void;
}
export const useMockStore = create<MockStore>((set) => ({
  user: {
    name: '',
    email: '',
    role: null,
    isAuthenticated: false,
    teamName: null,
  },
  habits: {
    water: false,
    steps: false,
    sleep: false,
    lesson: false,
  },
  biometrics: {
    submittedThisWeek: false,
    lastSubmissionDate: null,
  },
  points: 125, // Mock starting points
  login: (name, role) => set((state) => ({
    user: {
      ...state.user,
      name,
      role,
      isAuthenticated: true,
      teamName: role === 'coach' ? 'Team Captain' : 'Team Craig',
    }
  })),
  logout: () => set({
    user: { name: '', email: '', role: null, isAuthenticated: false, teamName: null },
    points: 0
  }),
  toggleHabit: (habit) => set((state) => {
    const isComplete = !state.habits[habit];
    return {
      habits: { ...state.habits, [habit]: isComplete },
      points: state.points + (isComplete ? 1 : -1)
    };
  }),
  submitBiometrics: () => set((state) => ({
    biometrics: { submittedThisWeek: true, lastSubmissionDate: new Date().toISOString() },
    points: state.points + 25
  })),
}));