import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    }
  )
);
