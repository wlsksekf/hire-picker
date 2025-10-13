'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';

const EditProfile = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        내 정보 수정
      </Typography>
      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              id="name"
              label="이름"
              name="name"
              defaultValue="홍길동"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              defaultValue="honggildong@example.com"
              disabled
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              name="password"
              label="새 비밀번호"
              type="password"
              id="password"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              name="confirmPassword"
              label="새 비밀번호 확인"
              type="password"
              id="confirmPassword"
            />
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              정보 저장
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default EditProfile;