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
    if (config.url.includes('/api/auth/signup') || config.url.includes('/api/auth/send-verification') || config.url.includes('/api/auth/check-verification')) {
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

/**
 * [신규] 이메일 인증 코드 발송 요청
 * @param {string} email - 인증받을 이메일
 */
export const sendVerificationEmail = (email) => {
    // 백엔드 /api/auth/send-verification 호출
    return api.post('/api/auth/send-verification', { email });
};

/**
 * [신규] 이메일 인증 코드 확인 요청
 * @param {string} email - 인증받을 이메일
 * @param {string} verificationCode - 사용자가 입력한 코드
 */
export const checkVerificationCode = (email, verificationCode) => {
    return api.post('/api/auth/check-verification', { email, verificationCode });
}; 

/**
 * [수정] 개인 회원가입 (모든 데이터 전송)
 * @param {object} signupData - SignupRequestDto와 일치하는 객체
 * (e.g., { email, password, nickname, name, address, verificationCode, ... })
 */
export const signupPersonal = (signupData) => {
    // 백엔드 /api/auth/signup/personal 호출
    return api.post('/api/auth/signup/personal', signupData);
};

/**
 * [신규] 회사 이름으로 회사 검색
 * @param {string} query - 검색할 회사 이름
 */
export const searchCompanies = (query) => {
    return api.get('/api/companies/search', { params: { name: query } });
};

/**
 * [신규] 기업 회원가입
 * @param {object} signupData - CompanySignupRequestDto와 일치하는 객체
 */
export const signupCompany = (signupData) => {
    return api.post('/api/auth/signup/company', signupData);
};


// `api` 변수를 기본 내보내기로 설정
export { api };

/**
 * [신규] AI 자기소개서 4종 초안 생성
 * @param {string} prompt - AI에게 전달할 키워드
 */
export const generateAiFullDraft = (prompt) => {
    return api.post('/api/ai/generate-full-draft', { prompt });
};

/**
 * [크레딧 기능 추가] 현재 사용자의 크레딧 잔액을 조회
 * @returns {Promise<number>} 크레딧 잔액
 */
export const getCreditBalance = () => {
  return api.get('/api/credits/balance')
    .then(response => response.data.balance)
    .catch(error => {
      console.error('크레딧 잔액 조회 실패:', error);
      return 0;
    });
};

/**
 * [크레딧 기능 추가] 토스 페이먼츠 결제를 위한 주문을 백엔드에 생성
 * @param {string} packageId - 선택한 상품 ID
 * @returns {Promise<object>} 결제 시작에 필요한 정보 (orderId, orderName, amount 등)
 */
export const initiateTossPayment = (packageId) => {
  return api.post('/api/payment/initiate', { packageId })
    .then(response => response.data)
    .catch(error => {
      console.error('결제 시작 실패:', error);
      throw error;
    });
};

/**
 * [크레딧 기능 추가] 토스 페이먼츠 결제를 백엔드에 최종 승인 요청
 * @param {object} paymentData - { paymentKey, orderId, amount }
 * @returns {Promise<object>} 결제 승인 결과
 */
export const confirmTossPayment = (paymentData) => {
  return api.post('/api/payment/confirm', paymentData)
    .then(response => response.data)
    .catch(error => {
      console.error('결제 승인 실패:', error);
      throw error;
    });
};