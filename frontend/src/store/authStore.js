import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.

const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,
  login: (token) => {
    // API 클라이언트의 기본 헤더에 토큰 설정
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    // API 클라이언트 헤더에서 토큰 제거
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
