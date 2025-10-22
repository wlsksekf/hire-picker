'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Paper,
  FormControl, // 추가
  FormLabel,   // 추가
  RadioGroup,  // 추가
  FormControlLabel, // 추가
  Radio,       // 추가
} from '@mui/material';
import AnimatedButton from '@/components/AnimatedButton';

// 회원가입 페이지 컴포넌트
function SignupPage() {
  const [tabValue, setTabValue] = useState(0); // 탭 값 (개인회원/기업회원)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState(''); // 닉네임 상태 추가
  const [name, setName] = useState('');         // 이름 상태 추가
  const [gender, setGender] = useState('');     // 성별 상태 추가

  // 탭 변경 핸들러
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  async function handleSubmit(event) {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname, name, gender }), // 닉네임, 이름, 성별 추가
      });

      if (response.ok) {
        alert('회원가입 성공!');
        // 성공 시 로그인 페이지로 리다이렉트 또는 다른 처리
        // router.push('/login'); // Next.js router 사용 시
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('회원가입 요청 중 오류 발생:', error);
      alert('회원가입 요청 중 오류가 발생했습니다.');
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          회원가입
        </Typography>
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="개인회원" />
            <Tab label="기업회원" />
          </Tabs>
        </Box>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일 주소"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname" // 닉네임 필드 추가
            label="닉네임"
            name="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="name" // 이름 필드 추가
            label="이름"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormControl component="fieldset" margin="normal" required fullWidth>
            <FormLabel component="legend">성별</FormLabel>
            <RadioGroup
              row
              aria-label="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <FormControlLabel value="MALE" control={<Radio />} label="남성" />
              <FormControlLabel value="FEMALE" control={<Radio />} label="여성" />
            </RadioGroup>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="비밀번호 확인"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <AnimatedButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
          >
            회원가입
          </AnimatedButton>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignupPage;