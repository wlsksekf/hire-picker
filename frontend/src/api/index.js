import axios from 'axios';
import useAuthStore from '../store/authStore'; // useAuthStore 임포트 (추가됨)

// Axios 인스턴스 생성
const api = axios.create({
  // baseURL을 상대경로로 설정하여 Next.js의 rewrites 프록시를 사용
  baseURL: '/',
  withCredentials: true, // 백엔드와 쿠키를 주고받기 위해 추가
});



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