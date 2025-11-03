const path = require('path');

// 루트 경로의 .env 파일을 불러옵니다.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // .env 파일의 변수들을 브라우저 환경에 노출시킵니다。
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    NEXT_PUBLIC_TOSS_CUSTOMER_KEY: process.env.NEXT_PUBLIC_TOSS_CUSTOMER_KEY,
  },

  // Next.js의 rewrites 설정을 통해 API 요청을 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*', // /api로 시작하는 모든 요청
        // 개발 환경에서는 localhost:8080으로, 프로덕션 환경에서는 Docker 컨테이너 이름(backend:8080)으로 요청을 보냅니다.
        destination: isProduction
          ? 'http://backend:8080/api/:path*'
          : 'http://localhost:8080/api/:path*',
      },
      {
        source: '/signup/company/:path*', // /signup/company로 시작하는 모든 요청
        destination: isProduction
          ? 'http://backend:8080/signup/company/:path*'
          : 'http://localhost:8080/signup/company/:path*',
      },
    ];
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
