import AppProviders from '../components/AppProviders';
import StyledComponentsRegistry from '../lib/registry';
import SiteSearchChatbot from '../components/SiteSearchChatbot';
import WebSearchChatbot from '../components/WebSearchChatbot';

// Next.js의 루트 레이아웃 컴포넌트
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <AppProviders>
            {children}
            {/* 두 개의 새로운 챗봇 컴포넌트 렌더링 */}
            <SiteSearchChatbot />
            <WebSearchChatbot />
          </AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
