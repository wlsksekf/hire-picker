import { create } from 'zustand';
import { api } from '../api'; // API 클라이언트를 임포트합니다.
import Router from 'next/router'; // next/router 임포트

// Zustand를 사용한 인증 상태 관리 스토어 (HttpOnly 쿠키 방식)
const useAuthStore = create((set, get) => ({
  isAuthenticated: false, // 인증 상태
  isLoading: true, // 인증 상태 확인 중 로딩 상태
  user: null, // 사용자 정보 (p_user_idx 등을 포함)
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
    console.log('AuthStore: login called', userData); // 추가
    set({ isAuthenticated: true, user: userData });
    get().startLogoutTimer(); // 로그인 시 타이머 시작
  },

  // 로그아웃 처리
  logout: (isAutoLogout = false) => {
    console.log('AuthStore: logout called');
    get().clearLogoutTimer(); // 로그아웃 시 타이머 제거
    // 백엔드에 /api/auth/logout을 호출하여 쿠키를 삭제하는 로직 추가
    api.post('/api/auth/logout')
      .then(() => {
        console.log('AuthStore: Backend logout successful.');
        set({ isAuthenticated: false, user: null });
        if (isAutoLogout) {
          Router.push('/'); // 자동 로그아웃 시 홈페이지로 리디렉션
        }
      })
      .catch((error) => {
        console.error('AuthStore: Backend logout failed', error);
        // 백엔드 로그아웃 실패 시에도 프론트엔드 상태는 초기화
        set({ isAuthenticated: false, user: null });
        if (isAutoLogout) {
          Router.push('/'); // 자동 로그아웃 시 홈페이지로 리디렉션
        }
      });
  },

  // 앱 초기 로드 시, 보호된 API 호출을 통해 로그인 상태 확인
  // Promise를 반환하여 호출자가 완료를 기다릴 수 있도록 함
  initializeAuth: () => {
    console.log('AuthStore: initializeAuth called. Current state:', get());
    set({ isLoading: true });

    // ★ validateStatus 옵션을 추가하여 401을 에러로 처리하지 않도록 설정
    return api.get('/api/users/me', {
      validateStatus: function (status) {
        return status < 500; // 500 미만의 상태 코드는 모두 정상 응답으로 간주
      },
    })
    .then((response) => {
      // ★ 응답 상태 코드에 따라 분기
      console.log('AuthStore: /api/users/me 응답 상태:', response.status);
      console.log('AuthStore: /api/users/me 응답 데이터:', response.data);

      if (response.status === 200) {
        // 200 OK: 로그인 성공
        console.log('AuthStore: Raw response data:', response.data); // 원본 데이터 로그 추가
        console.log('AuthStore: initializeAuth success', response.data);
        set({ isAuthenticated: true, user: response.data, isLoading: false });
        get().startLogoutTimer(); // 초기화 시 타이머 시작
        return response.data; // 사용자 정보 반환
      } else {
        // 401 또는 다른 4xx: 로그아웃 상태
        console.log('AuthStore: User not authenticated (status: ' + response.status + ').');
        set({ isAuthenticated: false, user: null, isLoading: false });
        get().clearLogoutTimer(); // 로그아웃 상태이므로 타이머 제거
        return null;
      }
    })
    .catch((error) => {
      // 5xx 에러 등 예외적인 실제 서버 오류만 여기로 들어옴
      console.error('AuthStore: initializeAuth failed with a server error', error);
      set({ isAuthenticated: false, user: null, isLoading: false });
      get().clearLogoutTimer(); // 에러 발생 시 타이머 제거
      return null;
    });
  },
}));

export default useAuthStore;
