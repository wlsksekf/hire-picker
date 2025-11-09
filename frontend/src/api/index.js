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
  (error) => {
    const originalRequest = error.config;
    console.log('Axios Interceptor: Received error', error.response.status, originalRequest.url);
    // 401 에러이고, 이미 재시도한 요청이 아니며, 로그인/회원가입/토큰 갱신 요청이 아닌 경우
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/') && !originalRequest.url.includes('/api/users/my-profile')) {
      originalRequest._retry = true; // 재시도 플래그 설정
      console.log('Axios Interceptor: Attempting token refresh for', originalRequest.url);

      // Promise 체이닝 방식으로 변경
      return api.post('/api/auth/refresh').then(() => {
        console.log('Axios Interceptor: Token refresh successful.');

        // 토큰 갱신 성공 후, authStore의 인증 상태를 다시 초기화하여 user 정보를 가져옴
        useAuthStore.getState().initializeAuth();

        // 원래 요청을 재시도하는 대신, initializeAuth가 처리하도록 함
        return Promise.resolve({ status: 200, data: { message: 'Token refreshed, re-initializing auth.' } }); // 임시 응답 반환
      }).catch((refreshError) => {
        // 리프레시 토큰 갱신 실패 시 (예: 리프레시 토큰 만료)
        console.log('Axios Interceptor: Token refresh failed (expected in logged-out state).');

        // 로그아웃 처리
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
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
    // 백엔드 스펙: POST /api/ai/resume-draft { userData, jobPostingData, resumeDraft }
    const body = { userData: String(prompt || ''), jobPostingData: null, resumeDraft: null };
    return api.post('/api/ai/resume-draft', body).then(res => res);
};

// [AI] 기존 초안을 함께 보내 개선 요청 (refine 모드)
export const generateAiResumeDraft = ({ userData = '', jobPostingData = null, resumeDraft = null } = {}) => {
  const body = { userData: String(userData || ''), jobPostingData, resumeDraft };
  return api.post('/api/ai/resume-draft', body).then(res => res);
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
 * [크레딧 기능 추가] 상점에서 사용할 크레딧 상품 목록 + 잔액을 동시 제공
 * 프론트 카드/결제 페이지가 동일 정보를 활용하도록 정적 상품 목록을 제공하고,
 * 잔액은 실제 API에서 조회한다.
 */
export const getCreditProducts = () => {
  const products = [
    {
      id: 'CREDIT_10K',
      badge: 'NEW',
      title: '스타터 코인팩',
      description: '입문자를 위한 기본 충전',
      credits: 10000,
      price: 10000,
      accent: '#1c63ff',
      imageVariant: 'single',
    },
    {
      id: 'CREDIT_50K',
      badge: 'BEST',
      title: '프로 코인팩',
      description: '10% 혜택으로 넉넉하게',
      credits: 50000,
      price: 45000,
      accent: '#4f6bff',
      imageVariant: 'stack',
    },
    {
      id: 'CREDIT_100K',
      badge: 'HOT',
      title: '언리미티드 코인팩',
      description: '가장 많이 찾는 할인 구성',
      credits: 100000,
      price: 70000,
      accent: '#2b4edb',
      imageVariant: 'bundle',
    },
  ];

  return getCreditBalance()
    .then(balance => ({ products, balance }))
    .catch(() => ({ products, balance: 0 }));
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
 * [결제 내역] 현재 로그인한 사용자의 결제 내역을 조회
 * @returns {Promise<Array>} 결제 내역 목록
 */
export const getPaymentHistory = () => {
  return api.get('/api/payment/history')
    .then(response => response.data)
    .catch(error => {
      console.error('결제 내역 조회 실패:', error);
      throw error;
    });
};

/**
 * [마이페이지] 현재 로그인한 사용자의 개인정보 조회
 * 쿠키의 액세스 토큰을 통해 인증
 * @returns {Promise<object>} 사용자 정보 (name, nickname, email, imageUrl 등)
 */
export function getUserProfile() {
  return api.get('/api/users/me')
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

// [마이페이지] 기본정보 확장 업데이트(이메일 제외)
export function updateUserProfileDetails(updateData) {
  // 이름/성별/전화/주소/닉네임/비밀번호 등 확장 필드
  return api.patch('/api/users/my-profile/details', updateData)
    .then((res) => res.data)
    .catch((err) => { console.error('기본정보 확장 업데이트 실패:', err); throw err; });
}

// [마이페이지] 학력 조회/저장
export function getAcademics() {
  return api.get('/api/users/academics').then(res => res.data);
}
export function saveAcademics(academics) {
  return api.put('/api/users/academics', academics).then(res => res.data);
}

// [검색] 학교 검색 (UI 자동완성)
export function searchSchools(query) {
  return api.get('/api/schools/search', { params: { name: query } })
    .then(res => res.data);
}

// [검색] 정확히 일치하는 학교 찾기
export function findExactSchool(name) {
  return api.get('/api/schools/find', { params: { name } })
    .then(res => res.data)
    .catch(() => null); // 없으면 null 반환
}

// [마이페이지] 경력 조회/저장
export function getExperiences() {
  return api.get('/api/users/experiences').then(res => res.data);
}
export function saveExperiences(experiences) {
  return api.put('/api/users/experiences', experiences).then(res => res.data);
}

// [마이페이지] 병역 조회/저장
export function getMilitary() {
  return api.get('/api/users/military').then(res => res.data);
}
export function saveMilitary(military) {
  return api.put('/api/users/military', military).then(res => res.data);
}

// [마이페이지] 자격증 조회/저장
export function getCertifications() {
  return api.get('/api/users/certifications').then(res => res.data || []);
}
export function saveCertifications({ certIdxList = [], certNameList = [] } = {}) {
  return api.put('/api/users/certifications', { resumeIdx: null, certIdxList, certNameList }).then(res => res.data);
}

// [이력서] 수정
export function updateResume(resumeId, payload) {
  return api.put(`/api/resume/${resumeId}`, payload).then(res => res.data);
}

// [이력서] 자격증 매핑 저장(이력서별)
// - certIdxList를 알고 있으면 전달, 모르면 certNameList로 전달하면 백엔드가 마스터 생성/매핑 처리
export function saveResumeCertifications(resumeIdx, { certIdxList = [], certNameList = [] } = {}) {
  return api
    .put('/api/users/certifications', { resumeIdx, certIdxList, certNameList })
    .then(res => res.data);
}

// [이력서] 자동채움 데이터(학력/경력/병역) 일괄 조회
export function getResumeTemplate() {
  return api.get('/api/resumes/template').then(res => res.data);
}

// [이력서] 신규 생성 (multipart: resumeDto JSON + imageFile)
export function createResume(resumeDto, imageFile) {
  const fd = new FormData();
  // resumeDto를 JSON Blob으로 첨부
  fd.append('resumeDto', new Blob([JSON.stringify(resumeDto)], { type: 'application/json' }));
  if (imageFile) fd.append('imageFile', imageFile);
  return api.post('/api/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(res => res.data);
}

// [공통] 자격증 자동완성 검색
export function searchCertifications(keyword) {
  if (!keyword || keyword.trim().length === 0) return Promise.resolve([]);
  return api.get('/api/certifications/search', { params: { keyword } })
    .then(res => Array.isArray(res.data) ? res.data : []);
}
