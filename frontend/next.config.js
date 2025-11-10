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
    NEXT_PUBLIC_KAKAO_REST_API_KEY: process.env.KAKAO_OAUTH_CLIENT_ID, // 카카오 REST API 키 추가
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hirepicker-storage.s3.ap-northeast-2.amazonaws.com',
      },
    ],
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

  // ESM 패키지 트랜스파일 설정 추가
  transpilePackages: ['@react-pdf/renderer'],
};

module.exports = nextConfig;
