import axios from 'axios';
import useAuthStore from '../store/authStore'; // useAuthStore 임포트 (추가됨)

// Axios 인스턴스 생성
const api = axios.create({
  // baseURL을 상대경로로 설정하여 Next.js의 rewrites 프록시를 사용
  baseURL: '/',
  withCredentials: true, // 백엔드와 쿠키를 주고받기 위해 추가
  timeout: 90000, // 90초 타임아웃 설정 (밀리초 단위)
});

// 응답 인터셉터: 401 Unauthorized 에러 처리 (토큰 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Axios Interceptor: Received error', error.response.status, originalRequest.url);
    // 401 에러이고, 이미 재시도한 요청이 아니며, 로그인/회원가입/토큰 갱신 요청이 아닌 경우
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/') && !originalRequest.url.includes('/api/users/my-profile')) {
      originalRequest._retry = true; // 재시도 플래그 설정
      console.log('Axios Interceptor: Attempting token refresh for', originalRequest.url);

      try {
        // 리프레시 토큰 엔드포인트 호출
        await api.post('/api/auth/refresh');
        console.log('Axios Interceptor: Token refresh successful.');

        // 토큰 갱신 성공 후, authStore의 인증 상태를 다시 초기화하여 user 정보를 가져옴
        // 이렇게 하면 새로운 accessToken으로 /api/users/my-profile을 다시 호출하게 됨
        useAuthStore.getState().initializeAuth();

        // 원래 요청을 재시도하는 대신, initializeAuth가 처리하도록 함
        return Promise.resolve({ status: 200, data: { message: 'Token refreshed, re-initializing auth.' } }); // 임시 응답 반환
      } catch (refreshError) {
        // 리프레시 토큰 갱신 실패 시 (예: 리프레시 토큰 만료)
        // 이 에러는 예상된 상황이므로 console.error로 찍지 않습니다.
        // console.error('Axios Interceptor: Token refresh failed', refreshError); // 이 줄을 주석 처리 또는 제거
        console.log('Axios Interceptor: Token refresh failed (expected in logged-out state).'); // 대신 정보성 로그 추가
        
        // 로그아웃 처리
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
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

/**
 * [마이페이지] 현재 로그인한 사용자의 개인정보 조회
 * 쿠키의 액세스 토큰을 통해 인증
 * @returns {Promise<object>} 사용자 정보 (name, nickname, email, imageUrl 등)
 */
export function getUserProfile() {
  return api.get('/api/users/my-profile')
    .then(function(response) {
      return response.data;
    })
    .catch(function(error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    });
}

/**
 * [마이페이지] 사용자 정보 업데이트 (부분 수정)
 * 
 * HTTP PATCH 메서드 사용:
 * - PATCH는 리소스의 일부분만 수정할 때 사용하는 HTTP 메서드입니다
 * - PUT과 달리 모든 필드를 보낼 필요 없이, 변경할 필드만 전송합니다
 * - 예시: { nickname: "새닉네임" } 만 보내면 닉네임만 변경됨
 * 
 * 쿠키의 액세스 토큰을 통해 인증
 * 
 * @param {object} updateData - 업데이트할 정보 (변경할 필드만 포함)
 *   예시 1: { nickname: "새닉네임" } - 닉네임만 변경
 *   예시 2: { nickname: "새닉네임", password: "새비밀번호" } - 닉네임과 비밀번호 변경
 * @returns {Promise<object>} 업데이트 결과
 */
export function updateUserProfile(updateData) {
  return api.patch('/api/users/my-profile', updateData)
    .then(function(response) {
      return response.data;
    })
    .catch(function(error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    });
}