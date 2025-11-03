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

// 기업 정보 수정 페이지 컴포넌트
function EditCompanyInfo() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        기업 정보 수정
      </Typography>
      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              id="companyName"
              label="기업명"
              name="companyName"
              defaultValue="(주)하이어피커"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              id="ceoName"
              label="대표자명"
              name="ceoName"
              defaultValue="홍길동"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              id="address"
              label="주소"
              name="address"
              defaultValue="서울특별시 강남구"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              id="companyDescription"
              label="기업 소개"
              name="companyDescription"
              defaultValue="최고의 인재를 찾는 가장 빠른 방법, 하이어피커입니다."
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
}

export default EditCompanyInfo;
