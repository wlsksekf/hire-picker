import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.

// Zustand를 사용한 인증 상태 관리 스토어 (HttpOnly 쿠키 방식)
const useAuthStore = create((set, get) => ({
  isAuthenticated: false, // 인증 상태
  isLoading: true, // 인증 상태 확인 중 로딩 상태
  user: null, // 사용자 정보 (platform 포함)
  logoutTimer: null, // 로그아웃 타이머 ID

  // 로그아웃 타이머 시작
  startLogoutTimer: () => {
    get().clearLogoutTimer(); // 기존 타이머 제거
    const timer = setTimeout(() => {
      get().logout(true); // 타이머 만료 시 로그아웃 (자동 로그아웃임을 명시)
    }, 1800 * 1000); // 30분
    set({ logoutTimer: timer });
  },

  // 로그아웃 타이머 리셋
  resetLogoutTimer: () => {
    get().startLogoutTimer();
  },

  // 로그아웃 타이머 제거
  clearLogoutTimer: () => {
    if (get().logoutTimer) {
      clearTimeout(get().logoutTimer);
      set({ logoutTimer: null });
    }
  },

  // 로그인 처리 (상태만 변경)
  login: (userData) => {
    console.log('AuthStore: login called', userData);
    const normalized = {
      ...userData,
      userType: userData?.userType || userData?.user_type,
    };
    set({ isAuthenticated: true, user: normalized });
    get().startLogoutTimer(); // 로그인 시 타이머 시작
  },

  // 로그아웃 처리
  logout: (isAutoLogout = false) => {
    console.log('AuthStore: Logout process started.');
    const user = get().user;
    get().clearLogoutTimer();

    api.post('/api/auth/logout')
      .finally(() => {
        console.log('AuthStore: Backend logout finished. User object:', user);
        set({ isAuthenticated: false, user: null });

        if (isAutoLogout) {
          console.log('AuthStore: Auto-logout detected. Redirecting to /.');
          window.location.href = '/';
          return;
        }

        if (user && user.provider) {
          console.log(`AuthStore: User provider is "${user.provider}". Checking for social logout.`);
          switch (user.provider.toUpperCase()) {
            case 'KAKAO': {
              console.log('AuthStore: KAKAO platform detected. Redirecting to Kakao logout.');
              const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
              const logoutRedirectUri = `${window.location.origin}/`;
              const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${kakaoApiKey}&logout_redirect_uri=${logoutRedirectUri}`;
              console.log('AuthStore: Constructed Kakao logout URL:', kakaoLogoutUrl); // 디버깅용 로그 추가
              window.location.href = kakaoLogoutUrl;
              return;
            }
            case 'NAVER':
              console.log('AuthStore: NAVER platform detected. Clearing local session and redirecting to home.');
              window.location.href = '/';
              return;
            case 'GOOGLE':
              console.log('AuthStore: GOOGLE platform detected. Not implemented.');
              break;
          }
        } else {
          console.log('AuthStore: No user platform found.');
        }

        console.log('AuthStore: No social logout handled. Redirecting to /login.');
        window.location.href = '/login';
      });
  },

  // 앱 초기 로드 시, 보호된 API 호출을 통해 로그인 상태 확인
  initializeAuth: () => {
    console.log('AuthStore: initializeAuth called. Current state:', get());
    set({ isLoading: true });

    return api.get('/api/users/me', {
      validateStatus: function (status) {
        return status < 500; // 500 미만의 상태 코드는 모두 정상 응답으로 간주
      },
    })
    .then((response) => {
      console.log('AuthStore: /api/users/me 응답 상태:', response.status);
      console.log('AuthStore: /api/users/me 응답 데이터:', response.data);

      if (response.status === 200) {
        console.log('AuthStore: initializeAuth success', response.data);
        const userData = {
          ...response.data,
          userType: response.data?.userType || response.data?.user_type,
        };
        set({ isAuthenticated: true, user: userData, isLoading: false });
        get().startLogoutTimer();
        return response.data;
      } else {
        console.log('AuthStore: User not authenticated (status: ' + response.status + ').');
        set({ isAuthenticated: false, user: null, isLoading: false });
        get().clearLogoutTimer();
        return null;
      }
    })
    .catch((error) => {
      console.error('AuthStore: initializeAuth failed with a server error', error);
      set({ isAuthenticated: false, user: null, isLoading: false });
      get().clearLogoutTimer();
      return null;
    });
  },
}));

export default useAuthStore;
