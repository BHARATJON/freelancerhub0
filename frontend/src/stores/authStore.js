import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login user
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Socket is now initialized globally in main.jsx, no need to call initSocket here
          // If you need to emit 'join-room' for the user, do it here using window.socket
          if (window.socket && user.id) {
            window.socket.emit('join-room', user.id);
          }

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          }
        }
      },

      // Register user
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Socket is now initialized globally in main.jsx, no need to call initSocket here
          if (window.socket && user.id) {
            window.socket.emit('join-room', user.id);
          }

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          }
        }
      },

      // Logout user
      logout: () => {
        // Disconnect socket before logging out
        if (window.socket) {
          window.socket.disconnect();
          delete window.socket;
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Remove token from axios headers
        delete api.defaults.headers.common['Authorization']
      },

      // Get current user
      getCurrentUser: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await api.get('/auth/me')
          set({ user: response.data })
          // Socket is now initialized globally, no need to re-initialize here
          // If you need to emit 'join-room' for the user, do it here using window.socket
          if (window.socket && response.data && response.data.id) {
            window.socket.emit('join-room', response.data.id);
          }
        } catch (error) {
          console.error('Error getting current user:', error)
          get().logout()
        }
      },

      // Update user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      // Initialize auth state
      init: () => {
        const { token, user } = get()
        if (token && user) { // Ensure user is also present
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          get().getCurrentUser()
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)