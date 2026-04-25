import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';

describe('useAuthStore (Admin)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('should initialize correctly', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle admin login state', () => {
    const mockAdmin = { id: 'admin-1', role: 'owner' };
    const mockToken = 'admin-token';

    useAuthStore.getState().login(mockAdmin, mockToken);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.role).toBe('owner');
    expect(state.token).toBe(mockToken);
  });
});
