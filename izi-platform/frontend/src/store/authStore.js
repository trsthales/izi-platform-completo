import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.login(email, password)
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return { success: true }
        } catch (error) {
          const message = error.message || 'Erro ao realizar login'
          set({
            error: message,
            isLoading: false
          })
          return { success: false, error: message }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.register(name, email, password)
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          return { success: true }
        } catch (error) {
          // Prefer detailed server validation messages
          let message = error.message || 'Erro ao registrar usuário'
          if (error.details && Array.isArray(error.details) && error.details.length > 0) {
            // join validator messages
            message = error.details.map(d => d.msg || d.message).join('; ')
          }
          set({
            error: message,
            isLoading: false
          })
          return { success: false, error: message }
        }
      },

      logout: () => {
        authService.logout()
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'izi-auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    }
  )
)