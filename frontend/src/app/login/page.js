
'use client';

import React, { useState } from 'react';
import {Container,Box,Typography,TextField,Tabs,Tab,Paper} from '@mui/material';
import AnimatedButton from '@/components/AnimatedButton';

const LoginPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일 주소"
            name="email"
            autoComplete="email"
            autoFocus
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
          />
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
      </Paper>
    </Container>
  );
};

export default LoginPage;
