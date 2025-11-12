import { create } from "zustand";
import { api } from "../api"; // API 클라이언트를 임포트합니다.

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
    console.log("AuthStore: login called", userData);
    const normalized = {
      ...userData,
      userType: userData?.userType || userData?.user_type,
    };
    set({ isAuthenticated: true, user: normalized });
    get().startLogoutTimer(); // 로그인 시 타이머 시작
  },

  // 로그아웃 처리
  logout: (isAutoLogout = false) => {
    console.log("AuthStore: Logout process started.");
    const user = get().user;
    get().clearLogoutTimer();

    api.post("/api/auth/logout").finally(() => {
      console.log("AuthStore: Backend logout finished. User object:", user);
      set({ isAuthenticated: false, user: null });

      if (isAutoLogout) {
        console.log("AuthStore: Auto-logout detected. Redirecting to /.");
        window.location.href = "/";
        return;
      }

      if (user && user.provider) {
        console.log(
          `AuthStore: User provider is "${user.provider}". Checking for social logout.`
        );
        switch (user.provider.toUpperCase()) {
          case "KAKAO": {
            console.log(
              "AuthStore: KAKAO platform detected. Redirecting to Kakao logout."
            );
            const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
            const logoutRedirectUri = `${window.location.origin}/`;
            const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${kakaoApiKey}&logout_redirect_uri=${logoutRedirectUri}`;
            console.log(
              "AuthStore: Constructed Kakao logout URL:",
              kakaoLogoutUrl
            ); // 디버깅용 로그 추가
            window.location.href = kakaoLogoutUrl;
            return;
          }
          case "NAVER":
            console.log(
              "AuthStore: NAVER platform detected. Clearing local session and redirecting to home."
            );
            window.location.href = "/";
            return;
          case "GOOGLE":
            console.log(
              "AuthStore: GOOGLE platform detected. Not implemented."
            );
            break;
        }
      } else {
        console.log("AuthStore: No user platform found.");
      }

      console.log(
        "AuthStore: No social logout handled. Redirecting to /login."
      );
      window.location.href = "/login";
    });
  },

  // 앱 초기 로드 시, 보호된 API 호출을 통해 로그인 상태 확인
  initializeAuth: () => {
    console.log("AuthStore: initializeAuth called. Current state:", get());
    // HttpOnly 쿠키는 document.cookie로 확인 불가하므로 로그 제거
    set({ isLoading: true });

    return api
      .get("/api/users/me", {
        validateStatus: function (status) {
          return status < 500; // 500 미만의 상태 코드는 모두 정상 응답으로 간주
        },
      })
      .then((response) => {
        console.log("AuthStore: /api/users/me 응답 상태:", response.status);
        console.log("AuthStore: /api/users/me 응답 데이터:", response.data);

        if (response.status === 200) {
          console.log("AuthStore: initializeAuth success", response.data);
          const userData = {
            ...response.data,
            userType: response.data?.userType || response.data?.user_type,
          };
          set({ isAuthenticated: true, user: userData, isLoading: false });
          get().startLogoutTimer();
          return response.data;
        } else if (response.status === 401) {
          // 401 에러인 경우 리프레시 토큰으로 갱신 시도
          console.log("AuthStore: 401 received, attempting token refresh");
          return api.post('/api/auth/refresh', {}, {
            validateStatus: function (status) {
              return status < 500; // 리프레시 요청도 500 미만은 정상으로 간주
            }
          })
            .then((refreshResponse) => {
              console.log("AuthStore: Refresh response status:", refreshResponse.status);
              if (refreshResponse.status === 200 || refreshResponse.status === 204) {
                console.log("AuthStore: Token refresh successful, retrying /api/users/me");
                // 리프레시 성공 후 다시 사용자 정보 조회 (약간의 지연을 두어 쿠키가 설정되도록 함)
                return new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(api.get("/api/users/me", {
                      validateStatus: function (status) {
                        return status < 500;
                      }
                    }));
                  }, 100); // 100ms 지연
                });
              } else {
                // 401은 로그인하지 않은 상태 (정상)이므로 에러로 throw하지 않음
                if (refreshResponse.status === 401) {
                  return Promise.reject({ response: { status: 401 }, isNormal: true });
                }
                throw new Error(`Token refresh failed with status: ${refreshResponse.status}`);
              }
            })
            .then((retryResponse) => {
              if (retryResponse.status === 200) {
                const userData = {
                  ...retryResponse.data,
                  userType: retryResponse.data?.userType || retryResponse.data?.user_type,
                };
                console.log("AuthStore: Retry /api/users/me success", userData);
                set({ isAuthenticated: true, user: userData, isLoading: false });
                get().startLogoutTimer();
                return retryResponse.data;
              } else {
                console.log("AuthStore: Retry /api/users/me failed with status:", retryResponse.status);
                set({ isAuthenticated: false, user: null, isLoading: false });
                get().clearLogoutTimer();
                return null;
              }
            })
            .catch((refreshError) => {
              // 리프레시 토큰이 없으면 로그인하지 않은 상태 (정상)
              // 401 에러는 정상적인 상황이므로 에러 로그를 출력하지 않음
              const isNormal401 = refreshError.isNormal || (refreshError.response?.status === 401);
              if (!isNormal401) {
                console.error("AuthStore: Token refresh failed during initializeAuth", refreshError);
              }
              // 리프레시 실패 시 로그아웃 상태로 설정
              set({ isAuthenticated: false, user: null, isLoading: false });
              get().clearLogoutTimer();
              return null;
            });
        } else {
          console.log(
            "AuthStore: User not authenticated (status: " +
              response.status +
              ")."
          );
          set({ isAuthenticated: false, user: null, isLoading: false });
          get().clearLogoutTimer();
          return null;
        }
      })
      .catch((error) => {
        // 네트워크 에러나 기타 에러의 경우
        console.error(
          "AuthStore: initializeAuth failed with an error",
          error
        );
        // 401 에러는 위에서 처리되므로 여기서는 다른 에러만 처리
        if (error.response?.status !== 401) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          get().clearLogoutTimer();
        }
        return null;
      });
  },
}));

export default useAuthStore;
