import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.

// Zustand를 사용한 인증 상태 관리 스토어
const useAuthStore = create((set) => ({
  token: null, // 인증 토큰
  isAuthenticated: false, // 인증 상태

  // 로그인 처리
  login: (token) => {
    // API 클라이언트의 기본 헤더에 토큰 설정
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, isAuthenticated: true }); // 상태 업데이트
  },

  // 로그아웃 처리
  logout: () => {
    // API 클라이언트 헤더에서 토큰 제거
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, isAuthenticated: false }); // 상태 초기화
  },
}));

export default useAuthStore;