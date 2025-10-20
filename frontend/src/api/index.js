import axios from 'axios';

const api = axios.create({
  // baseURL을 상대경로로 설정하여 Next.js의 rewrites 프록시를 사용
  baseURL: '/',
});

// `api` 변수를 기본 내보내기로 설정
export { api };
