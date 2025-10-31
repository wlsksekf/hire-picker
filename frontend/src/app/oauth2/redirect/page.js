// oauth2/redirect/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../store/authStore';

// OAuth2 로그인 성공 후 리디렉션되는 페이지
const OAuth2RedirectPage = () => {
  const router = useRouter();
  // 중앙 상태 관리 스토어에서 initializeAuth 함수를 가져옵니다.
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 이 페이지의 역할은 단 하나, 앱의 인증 로직을 다시 실행시키는 것입니다.
    // 백엔드에서 HttpOnly 쿠키를 설정해주면, 이 함수가 해당 쿠키를 사용하여
    // /api/users/me를 호출하고 사용자 상태를 업데이트합니다.
    console.log('OAuth2 Redirect: Initializing authentication...');
    initializeAuth();

    // 인증 처리는 백그라운드에서 진행되므로, 사용자는 즉시 메인 페이지로 보냅니다.
    // AppProviders 또는 다른 레이어에서 인증 상태(isLoading, isAuthenticated)에 따라
    // 로딩 스피너나 최종 컨텐츠를 보여줄 것입니다.
    router.push('/');

  }, [initializeAuth, router]);

  // 페이지가 잠시 표시되는 동안 보여줄 내용
  return (
    <div>
      <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default OAuth2RedirectPage;
