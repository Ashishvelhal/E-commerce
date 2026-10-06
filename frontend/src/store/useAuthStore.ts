import { create } from 'zustand';
import { User, Product } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string, refreshToken: string) => void;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let initialUser: User | null = null;
  const stored = localStorage.getItem('ecommerce_auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      initialUser = parsed.state?.user || null;
    } catch (e) {
      console.error(e);
    }
  }

  const saveToStorage = (user: User | null) => {
    localStorage.setItem(
      'ecommerce_auth',
      JSON.stringify({
        state: { user, isAuthenticated: !!user },
      })
    );
  };

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,

    setUser: (user) => {
      saveToStorage(user);
      set({ user, isAuthenticated: !!user });
    },

    setToken: (token, refreshToken) => {
      const user = get().user;
      if (user) {
        const updated = { ...user, token, refreshToken };
        saveToStorage(updated);
        set({ user: updated });
      }
    },

    login: async (credentials) => {
      set({ isLoading: true });
      try {
        const response = await api.post('/auth/login', credentials);
        const userData = response.data.data;
        saveToStorage(userData);
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (error: any) {
        set({ isLoading: false });
        return {
          success: false,
          message: error.response?.data?.message || 'Login failed. Please check your credentials.',
        };
      }
    },

    register: async (data) => {
      set({ isLoading: true });
      try {
        const response = await api.post('/auth/register', data);
        const userData = response.data.data;
        saveToStorage(userData);
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (error: any) {
        set({ isLoading: false });
        return {
          success: false,
          message: error.response?.data?.message || 'Registration failed.',
        };
      }
    },

    logout: () => {
      localStorage.removeItem('ecommerce_auth');
      set({ user: null, isAuthenticated: false });
    },

    updateUser: (data) => {
      const currentUser = get().user;
      if (currentUser) {
        const updated = { ...currentUser, ...data };
        saveToStorage(updated);
        set({ user: updated });
      }
    },

    toggleWishlist: async (productId: string) => {
      const currentUser = get().user;
      if (!currentUser) return;

      try {
        const response = await api.post(`/auth/wishlist/${productId}`);
        const updatedWishlist = response.data.data;
        const updatedUser = { ...currentUser, wishlist: updatedWishlist };
        saveToStorage(updatedUser);
        set({ user: updatedUser });
      } catch (error) {
        console.error('Failed to toggle wishlist', error);
      }
    },

    isInWishlist: (productId: string) => {
      const wishlist = get().user?.wishlist;
      if (!wishlist || !Array.isArray(wishlist)) return false;
      return wishlist.some((item) => (typeof item === 'string' ? item === productId : (item as Product)._id === productId));
    },
  };
});
