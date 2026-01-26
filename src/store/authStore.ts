import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponseDTO } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setLogin: (authResponse: AuthResponseDTO) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setLogin: (authResponse: AuthResponseDTO) => {
        set({
          user: {
            email: authResponse.email,
            rol: authResponse.rol,
          },
          token: authResponse.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set(initialState);
      },

      updateUser: (updatedUser: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...updatedUser,
            },
          };
        });
      },
    }),
    {
      name: 'auth-storage', // Clave en localStorage
    }
  )
);
