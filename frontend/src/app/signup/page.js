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
import { api } from '@/api'; // Axios 인스턴스 임포트

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

  function handleSubmit(event) {
    event.preventDefault(); // 기본 폼 제출 동작 방지
    console.log('회원가입 시도...', { email, password, confirmPassword, nickname, name, gender });

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      console.error('비밀번호 불일치');
      return;
    }

    const signupData = { email, password, nickname, name, gender };
    console.log('회원가입 데이터 전송:', signupData);

    api.post('/api/users/signup', signupData)
      .then(function(response) {
        console.log('회원가입 성공 응답:', response);
        if (response.status === 201) { // Assuming 201 Created for success
          alert('회원가입 성공!');
        } else {
          alert(`회원가입 실패: ${response.data.message || '알 수 없는 오류'}`);
        }
      })
      .catch(function(error) {
        console.error('회원가입 요청 중 오류 발생:', error.response || error);
        const errorMessage = error.response?.data?.message || error.message || '회원가입 요청 중 오류가 발생했습니다.';
        alert(`회원가입 실패: ${errorMessage}`);
      });
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
            id="name" // 이름 필드
            label="이름"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname" // 닉네임 필드
            label="닉네임"
            name="nickname"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
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
            autoComplete="new-password" // 자동완성 속성 추가
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
            autoComplete="new-password" // 자동완성 속성 추가
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