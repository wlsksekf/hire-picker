import AppProviders from '../components/AppProviders';
import StyledComponentsRegistry from '../lib/registry';

// Next.js의 루트 레이아웃 컴포넌트
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <AppProviders>{children}</AppProviders> {/* 앱 전체에 테마와 레이아웃을 제공 */}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
