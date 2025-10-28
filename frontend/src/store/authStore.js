import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.

// Zustand를 사용한 인증 상태 관리 스토어 (HttpOnly 쿠키 방식)
const useAuthStore = create((set, get) => ({
  isAuthenticated: false, // 인증 상태
  isLoading: true, // 인증 상태 확인 중 로딩 상태

  // 로그인 처리 (상태만 변경)
  login: () => {
    set({ isAuthenticated: true });
  },

  // 로그아웃 처리
  logout: () => {
    // TODO: 백엔드에 /api/auth/logout을 호출하여 쿠키를 삭제하는 로직 추가 권장
    set({ isAuthenticated: false });
  },

  // 앱 초기 로드 시, 보호된 API 호출을 통해 로그인 상태 확인
  initializeAuth: () => {
    set({ isLoading: true });
    // 쿠키가 유효한지 확인하기 위해 보호된 엔드포인트 호출
    api.get('/api/credits/balance')
      .then(() => {
        // 호출 성공 시, 로그인 상태로 변경
        set({ isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        // 호출 실패 시 (401 등), 로그아웃 상태로 변경
        set({ isAuthenticated: false, isLoading: false });
      });
  },
}));

export default useAuthStore;