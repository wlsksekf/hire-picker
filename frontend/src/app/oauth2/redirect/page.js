// oauth2/redirect/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../store/authStore';
import { api } from '../../../api'; // api 클라이언트 임포트

const OAuth2RedirectPage = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/users/me');
        const userData = response.data;

        if (userData) {
          login(userData); // login 액션 호출
          console.log('User data fetched and logged in.', userData);
          router.push('/');
        } else {
          console.error('User data not found after fetching /api/users/me.');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data or user not authenticated:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router, login]); // 의존성 배열에 login 추가

  return (
    <div>
      <p>로그인 처리 중...</p>
    </div>
  );
};

export default OAuth2RedirectPage;
