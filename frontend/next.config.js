const path = require('path');

// 루트 경로의 .env 파일을 불러옵니다.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // .env 파일의 변수들을 브라우저 환경에 노출시킵니다.
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    NEXT_PUBLIC_TOSS_CUSTOMER_KEY: process.env.NEXT_PUBLIC_TOSS_CUSTOMER_KEY,
  },

  // Next.js의 rewrites 설정을 통해 API 요청을 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*', // /api로 시작하는 모든 요청
        destination: 'http://localhost:8080/api/:path*', // 백엔드 서버의 /api 경로로 전달
      },

    ];
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
