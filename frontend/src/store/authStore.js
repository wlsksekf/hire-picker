import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.

// Zustand를 사용한 인증 상태 관리 스토어
const useAuthStore = create((set, get) => ({
  accessToken: null, // 액세스 토큰 (추가됨)
  refreshToken: null, // 리프레시 토큰 (추가됨)
  isAuthenticated: false, // 인증 상태

  // 로그인 처리 (액세스 및 리프레시 토큰 모두 받도록 변경됨)
  login: (accessToken, refreshToken) => {
    // 헤더 설정은 인터셉터가 담당하므로 여기서는 상태만 변경합니다.
    set({ accessToken, refreshToken, isAuthenticated: true });
    // 로컬 스토리지에 토큰 저장 (새로고침 시 유지)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // 로그아웃 처리 (액세스 및 리프레시 토큰 모두 제거하도록 변경됨)
  logout: () => {
    // 헤더 설정은 인터셉터가 담당하므로 여기서는 상태만 변경합니다.
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // 액세스 토큰 갱신 처리 (추가됨)
  refreshAccessToken: () => {
    const currentRefreshToken = get().refreshToken || localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      get().logout(); // 리프레시 토큰이 없으면 로그아웃
      return Promise.resolve(false); // Return a resolved promise for consistency
    }

    return api.post('/api/auth/refresh', { refreshToken: currentRefreshToken })
      .then(response => {
        const { accessToken: newAccessToken } = response.data;

        if (newAccessToken) {
          // 새로운 액세스 토큰으로 상태만 업데이트합니다.
          set({ accessToken: newAccessToken });
          localStorage.setItem('accessToken', newAccessToken);
          return true;
        }
        return false; // If newAccessToken is null/undefined
      })
      .catch(error => {
        console.error('액세스 토큰 갱신 실패:', error);
        get().logout(); // 갱신 실패 시 로그아웃
        return false;
      });
  },

  // 초기 로드 시 로컬 스토리지에서 토큰 불러오기 (추가됨)
  initializeAuth: () => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedAccessToken && storedRefreshToken) {
      get().login(storedAccessToken, storedRefreshToken);
    }
  },
}));

export default useAuthStore;