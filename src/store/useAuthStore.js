import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {}
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (e) {}
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      dashboardCache: null,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, dashboardCache: null }),
      setUser: (user) => set({ user }),
      setDashboardCache: (data) => set({ dashboardCache: data }),
    }),
    {
      name: 'pblsheba-admin-auth',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
