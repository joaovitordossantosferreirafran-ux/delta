import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  registerUser: async (email, password, name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.registerUser(email, password, name, phone);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userId', data.user.id);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Erro ao registrar', isLoading: false });
      throw error;
    }
  },

  registerCleaner: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.registerCleaner(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'cleaner');
      localStorage.setItem('cleanerId', data.cleaner.id);
      set({ user: data.cleaner, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Erro ao registrar', isLoading: false });
      throw error;
    }
  },

  login: async (email, password, userType) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login(email, password, userType);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', userType);
      if (userType === 'cleaner') {
        localStorage.setItem('cleanerId', data.user.id);
      } else {
        localStorage.setItem('userId', data.user.id);
      }
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Email ou senha inválidos', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('cleanerId');
    set({ user: null, token: null });
  },

  validateToken: async () => {
    try {
      const { data } = await authService.validateToken();
      set({ user: data.user });
      return data;
    } catch (error) {
      set({ token: null, user: null });
      localStorage.removeItem('token');
    }
  }
}));
