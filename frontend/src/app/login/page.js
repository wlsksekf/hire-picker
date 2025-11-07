'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Box, Typography, TextField, Tabs, Tab, Paper, Alert, Button, Divider } from '@mui/material';
import AnimatedButton from '@/components/AnimatedButton';
import { api } from '@/api';
import useAuthStore from '@/store/authStore';

// 로그인 페이지 컴포넌트
function LoginPage() {
  const [tabValue, setTabValue] = useState(0); // 탭 값 (0: 개인회원, 1: 기업회원)
  const [username, setUsername] = useState(''); // 이메일 또는 아이디 입력 값
  const [password, setPassword] = useState(''); // 비밀번호 입력 값
  const [error, setError] = useState(null); // 에러 메시지
  const [isSocialError, setIsSocialError] = useState(false); // 소셜 로그인 에러 여부

  const router = useRouter(); // Next.js 라우터
  const { login } = useAuthStore(); // 인증 스토어에서 로그인 함수 가져오기

  // 탭 변경 핸들러 - 탭 변경 시 입력 필드 초기화
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
    setUsername(''); // 입력 필드 초기화
    setPassword('');
    setError(null);
  }

  /**
   * 로그인 폼 제출 핸들러
   *
   * 흐름:
   * 1. 탭 값에 따라 userType 결정 (0: PERSONAL, 1: COMPANY)
   * 2. username, password, userType을 백엔드로 전송
   * 3. 성공 시: 인증 상태 초기화 후 메인 페이지로 이동
   * 4. 실패 시: 에러 메시지 표시
   */
  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSocialError(false);

    // === STEP 1: userType 결정 ===
    // 탭 값(tabValue)에 따라 회원 타입 결정
    // - 0 (개인회원 탭): PERSONAL
    // - 1 (기업회원 탭): COMPANY
    const userType = tabValue === 0 ? 'PERSONAL' : 'COMPANY';

    // === STEP 2: 백엔드로 로그인 요청 ===
    api.post('/api/auth/login', {
      email: username,      // 개인회원: 이메일, 기업회원: 아이디
      password,             // 비밀번호 (평문)
      userType: userType    // 회원 타입 (백엔드에서 효율적 검색용)
    })
      .then(function(response) {
        // === STEP 3: 로그인 성공 처리 ===
        console.log('로그인 성공. HttpOnly 쿠키가 설정되었습니다.');

        // 3-1. 백엔드가 HttpOnly 쿠키로 토큰을 설정 (access_token, refresh_token)
        //      프론트에서는 직접 토큰을 저장하지 않음 (XSS 공격 방지)

        // 3-2. 인증 상태 초기화: /api/users/me 호출하여 사용자 정보 가져오기
        //      완료를 기다린 후 페이지 전환 (비동기 처리)
        return useAuthStore.getState().initializeAuth();
      })
      .then(function(userData) {
        // 3-3. 인증 상태 초기화 완료 후 메인 페이지로 리다이렉트
        console.log('인증 상태 초기화 완료:', userData);
        router.push('/');
      })
      .catch(function(err) {
        // === STEP 4: 로그인 실패 처리 ===
        // 4-1. 소셜 계정 전용 에러 처리
        //      (소셜 로그인으로 가입한 계정이 로컬 로그인 시도 시)
        if (err.response?.data?.error === 'SOCIAL_ACCOUNT_NEEDS_PASSWORD_SETUP') {
          console.warn('소셜 계정 비밀번호 미설정:', err.response.data.message);
          setError(err.response.data.message || '소셜 계정입니다. 비밀번호를 설정해주세요.');
          setIsSocialError(true);
        } else if (err.response?.data?.message) {
          // 4-2. 백엔드에서 보낸 에러 메시지 우선 표시
          //      (예: 기업회원 승인 대기, 거부 등)
          console.warn('로그인 거부:', err.response.data.message);
          setError(err.response.data.message);
        } else {
          // 4-3. 일반 인증 실패 (이메일/아이디 또는 비밀번호 오류)
          //      탭에 따라 에러 메시지 다르게 표시
          console.error('로그인 실패:', err.response || err);
          const errorMsg = tabValue === 0
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : '아이디 또는 비밀번호가 올바르지 않습니다.';
          setError(errorMsg);
        }
      });
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          로그인
        </Typography>
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="개인회원" />
            <Tab label="기업회원" />
          </Tabs>
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label={tabValue === 0 ? "이메일 주소" : "아이디"}
            name="username"
            autoComplete={tabValue === 0 ? "email" : "username"}
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={tabValue === 0 ? "example@email.com" : "로그인 아이디"}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && ( // 에러 메시지가 있을 경우 표시
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
              {isSocialError && ( // 소셜 로그인 에러일 경우 비밀번호 설정 링크 표시
                <Link href="/forgot-password" passHref legacyBehavior>
                  <a sx={{ color: 'primary.main', textDecoration: 'underline', ml: 1 }}>
                    비밀번호 설정하기
                  </a>
                </Link>
              )}
            </Alert>
          )}

          <AnimatedButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
          >
            로그인
          </AnimatedButton>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>

        <Box sx={{ width: '100%' }}>
          <Button
            component="a"
            href="/api/oauth2/authorization/google" // 프록시를 사용하므로 /api 추가
            fullWidth
            variant="outlined"
            sx={{ justifyContent: 'center' }}
          >
            구글로 로그인
          </Button>
        </Box>

      </Paper>
    </Container>
  );
}

export default LoginPage;
