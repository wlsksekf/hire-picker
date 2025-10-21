import AppProviders from '../components/AppProviders';
import { Analytics } from '@vercel/analytics/react';

// Next.js의 루트 레이아웃 컴포넌트
export default function RootLayout({ children }) {
  return (
    <html lang="ko"> {/* 언어 설정 */}
      <body>
        <AppProviders>{children}</AppProviders> {/* 앱 전체에 테마와 레이아웃을 제공 */}
        {process.env.NODE_ENV === 'production' && <Analytics />} {/* 프로덕션 환경에서만 Vercel Analytics 사용 */}
      </body>
    </html>
  );
}