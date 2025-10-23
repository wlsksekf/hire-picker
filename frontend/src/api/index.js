import axios from 'axios';
import useAuthStore from '../store/authStore'; // useAuthStore 임포트 (추가됨)

// Axios 인스턴스 생성
const api = axios.create({
  // baseURL을 상대경로로 설정하여 Next.js의 rewrites 프록시를 사용
  baseURL: '/',
});

// 요청 인터셉터: 모든 요청에 액세스 토큰 추가 (추가됨)
api.interceptors.request.use(
  (config) => {
    console.log('Axios Request Interceptor:', config.method.toUpperCase(), config.url);
    // 공개 경로(회원가입 등)에는 토큰을 추가하지 않음
    if (config.url.includes('/api/users/signup')) {
      console.log('Public route, not adding token.');
      return config;
    }

    const { accessToken } = useAuthStore.getState(); // Zustand 스토어에서 토큰 가져오기
    if (accessToken) {
      console.log('Attaching token to request.');
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log('No access token found.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 발생 시 토큰 갱신 시도 (추가됨)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    // 401 에러이고, 이미 재시도한 요청이 아니라면
    if (error.response.status === 401 && error.response.data.message !== 'Invalid Refresh Token' && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정
      const { refreshAccessToken, logout } = useAuthStore.getState();

      return refreshAccessToken().then((refreshed) => { // 토큰 갱신 시도
        if (refreshed) {
          // 갱신 성공 시, 새 액세스 토큰으로 원래 요청 재시도
          const { accessToken } = useAuthStore.getState();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          // 갱신 실패 시, 로그아웃 처리
          logout();
          // 로그인 페이지로 리다이렉트 (필요하다면)
          // window.location.href = '/login';
          return Promise.reject(error); // 갱신 실패 시 원래 에러를 reject
        }
      }).catch(() => { // refreshAccessToken 자체에서 발생할 수 있는 에러 처리
        logout();
        return Promise.reject(error); // refreshAccessToken이 에러를 던지면 원래 에러를 reject
      });
    }
    return Promise.reject(error);
  }
);

// `api` 변수를 기본 내보내기로 설정
export { api };