'use client';

import { create } from 'zustand';
import { api } from '../api';

const useManageAuthStore = create((set) => ({
  isAuthenticated: false,
  manageUser: null,
  isLoading: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/manage/auth/login', payload);
      set({ isAuthenticated: true, manageUser: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isAuthenticated: false, manageUser: null, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout'); // 공용 로그아웃 엔드포인트 활용
    set({ isAuthenticated: false, manageUser: null });
  },

  hydrate: async () => {
    // 관리자 토큰은 HttpOnly 쿠키 기반이므로 별도 상태 확인 API를 구현하기 전까지는 noop
    return null;
  },
}));

export default useManageAuthStore;

