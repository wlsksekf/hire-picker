'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Container
} from '@mui/material';

// 개인 마이페이지 - 내 정보 수정 컴포넌트
function EditProfile() {
  const [profile, setProfile] = useState({
    imageUrl: 'https://via.placeholder.com/150', // 기본 이미지
    name: '홍길동',
    nickname: '의적'
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      setProfile(prev => ({ ...prev, imageUrl }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        회원 정보 수정
      </Typography>
      
      <Grid container spacing={3}>
        
        {/* 1. 왼쪽 사진 란 */}
        <Grid item xs={12} md={4}>
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
        </Grid>

        {/* 2. 오른쪽 정보 표 */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%'  // 높이를 100%로 설정
            }}
          >
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField 
                label="이름"
                defaultValue={profile.name} 
                fullWidth 
                margin="normal" 
                disabled 
              />
              <TextField 
                label="닉네임" 
                defaultValue={profile.nickname} 
                fullWidth 
                margin="normal" 
              />
              <TextField
                fullWidth
                id="email"
                label="이메일 주소"
                name="email"
                defaultValue="honggildong@example.com"
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                name="password"
                label="새 비밀번호"
                type="password"
                id="password"
                margin="normal"
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="새 비밀번호 확인"
                type="password"
                id="confirmPassword"
                margin="normal"
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary">
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