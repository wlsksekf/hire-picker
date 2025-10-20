'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Box, Typography, TextField, Tabs, Tab, Paper, Alert, Button, Divider } from '@mui/material';
import AnimatedButton from '@/components/AnimatedButton';
import { api } from '@/api';
import useAuthStore from '@/store/authStore';

function LoginPage() {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSocialError, setIsSocialError] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSocialError(false);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { accessToken } = response.data;
      login(accessToken); // Zustand 스토어에 토큰 저장
      router.push('/'); // 로그인 성공 시 메인 페이지로 이동
    } catch (err) {
      if (err.response?.data?.error === 'SOCIAL_ACCOUNT_NEEDS_PASSWORD_SETUP') {
        setError(err.response.data.message || '소셜 계정입니다. 비밀번호를 설정해주세요.');
        setIsSocialError(true);
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }
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
            id="email"
            label="이메일 주소"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
              {isSocialError && (
                <Link href="/forgot-password" passHref legacyBehavior>
                  <a style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: '8px' }}>
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
