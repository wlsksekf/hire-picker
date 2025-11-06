import AppProviders from '../components/AppProviders';
import StyledComponentsRegistry from '../lib/registry';
import Chatbot from '../components/Chatbot';
import AuthTimer from '../components/AuthTimer'; // AuthTimer 임포트

// Next.js의 루트 레이아웃 컴포넌트
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <AppProviders>
            <AuthTimer /> {/** AuthTimer 컴포넌트 추가 */}
            {children}
            <Chatbot />
          </AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
