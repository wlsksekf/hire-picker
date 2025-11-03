'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { getUserProfile, updateUserProfile } from '@/api';

// 개인 마이페이지 - 내 정보 수정 컴포넌트
function EditProfile() {
  const [profile, setProfile] = useState({
    imageUrl: 'https://via.placeholder.com/150', // 기본 이미지
    name: '',
    nickname: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 수정할 정보
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 페이지 로드 시 사용자 정보 가져오기
  useEffect(function() {
    getUserProfile()
      .then(function(userData) {
        setProfile({
          imageUrl: userData.imageUrl || 'https://via.placeholder.com/150',
          name: userData.name || '',
          nickname: userData.nickname || '',
          email: userData.email || ''
        });
        setNickname(userData.nickname || ''); // 닉네임 초기값 설정
        setLoading(false);
      })
      .catch(function(err) {
        console.error('사용자 정보 조회 실패:', err);
        setError('사용자 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.');
        setLoading(false);
      });
  }, []);

  // 파일 변경 핸들러
  function handleFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      setProfile(function(prev) {
        return { ...prev, imageUrl: imageUrl };
      });
    }
  }

  // 닉네임 변경 핸들러
  function handleNicknameChange(event) {
    setNickname(event.target.value);
  }

  // 비밀번호 변경 핸들러
  function handlePasswordChange(event) {
    const newPassword = event.target.value;
    setPassword(newPassword);
    
    // 비밀번호 확인란에 값이 있으면 다시 검증
    if (confirmPassword) {
      if (confirmPassword !== newPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다');
      } else {
        setPasswordError('');
      }
    }
  }

  // 비밀번호 확인 변경 핸들러 (실시간 검증)
  function handleConfirmPasswordChange(event) {
    const value = event.target.value;
    setConfirmPassword(value);
    
    // 실시간으로 비밀번호 일치 여부 확인
    if (value && value !== password) {
      setPasswordError('비밀번호가 일치하지 않습니다');
    } else {
      setPasswordError('');
    }
  }

  // 수정하기 버튼 핸들러
  function handleSubmit(event) {
    event.preventDefault();
    
    // 비밀번호가 입력되었는데 일치하지 않으면 중단
    if (password && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    // 업데이트할 데이터 준비
    const updateData = {
      nickname: nickname
    };
    
    // 비밀번호가 입력되었으면 추가
    if (password) {
      updateData.password = password;
    }
    
    // 백엔드로 업데이트 요청
    setLoading(true);
    updateUserProfile(updateData)
      .then(function(result) {
        alert('프로필이 성공적으로 업데이트되었습니다!');
        // 비밀번호 필드 초기화
        setPassword('');
        setConfirmPassword('');
        setLoading(false);
      })
      .catch(function(err) {
        console.error('프로필 업데이트 실패:', err);
        alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
      });
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        회원 정보 수정
      </Typography>
      
      <Grid container spacing={3}>
        
        {/* 1. 왼쪽 사진 란 */}
        {/* <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'  // 높이를 100%로 설정
            }}
          >
            <Avatar src={profile.imageUrl} sx={{ width: 150, height: 150, mb: 2 }} />
            <Button variant="contained" component="label">
              사진 업로드
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Typography variant="caption" sx={{ mt: 1 }}>
              JPG, PNG, GIF - 5MB 이하
            </Typography>
          </Paper>
        </Grid> */}

        {/* 2. 오른쪽 정보 표 */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%'  // 높이를 100%로 설정
            }}
          >
            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
              <TextField 
                label="이름"
                value={profile.name} 
                fullWidth 
                margin="normal" 
                disabled 
              />
              <TextField 
                label="닉네임" 
                value={nickname}
                onChange={handleNicknameChange}
                fullWidth 
                margin="normal" 
              />
              <TextField
                fullWidth
                id="email"
                label="이메일 주소"
                name="email"
                value={profile.email}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                name="password"
                label="새 비밀번호"
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                margin="normal"
                helperText="비밀번호를 변경하지 않으려면 비워두세요"
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="새 비밀번호 확인"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                margin="normal"
                error={Boolean(passwordError)}
                helperText={passwordError || ''}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  type="submit"
                  disabled={Boolean(passwordError)}
                >
                  수정하기
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}

export default EditProfile;