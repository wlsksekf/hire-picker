"use client";

import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { throttle } from 'lodash';

const AuthTimer = () => {
  const { isAuthenticated, resetLogoutTimer } = useAuthStore();

  const throttledReset = throttle(resetLogoutTimer, 5000); // 5초에 한 번만 실행

  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      
      const resetTimer = () => {
        throttledReset();
      };

      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [isAuthenticated, throttledReset]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default AuthTimer;
