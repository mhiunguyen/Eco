import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: !!localStorage.getItem('token'),
      isLoading: false,
      error: null,

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          // api.js returns response.data, backend structure: { success, message, token, user }
          const { token, user } = response;
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return { success: true };
        } catch (error) {
          const errorMsg = error.message || error.error?.message || 'Đăng ký thất bại';
          set({ 
            error: errorMsg, 
            isLoading: false 
          });
          return { success: false, error: errorMsg };
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔐 Attempting login with:', credentials);
          const response = await api.post('/auth/login', credentials);
          console.log('✅ Login response:', response);
          // api.js returns response.data, backend structure: { success, message, token, user }
          const { token, user } = response;
          
          if (!token) {
            console.error('❌ No token in response:', response);
            throw new Error('Không nhận được token từ server');
          }
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          console.log('✅ Login successful!');
          return { success: true };
        } catch (error) {
          console.error('❌ Login error:', error);
          console.error('Error details:', error.response?.data);
          const errorMsg = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
          set({ 
            error: errorMsg, 
            isLoading: false 
          });
          return { success: false, error: errorMsg };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const response = await api.get('/users/profile');
          set({ user: response.data });
        } catch (error) {
          console.error('Failed to get user:', error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);

export default useAuthStore;
