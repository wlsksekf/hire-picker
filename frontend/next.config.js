/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js의 rewrites 설정을 통해 API 요청을 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*', // /api로 시작하는 모든 요청
        destination: 'http://localhost:8080/api/:path*', // 백엔드 서버의 /api 경로로 전달
      },

    ];
  },
};

module.exports = nextConfig;
