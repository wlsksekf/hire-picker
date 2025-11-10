'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';

// 기업 정보 수정 페이지
export default function EditCompanyInfo() {
  const [companyData, setCompanyData] = useState({
    companyName: '샘플 기업명',
    ceoName: '홍길동',
    address: '서울특별시 강남구',
    description: '샘플 기업 소개입니다.',
    businessNumber: '123-45-67890',
    websiteUrl: 'https://example.com',
    employeeCount: '50',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('회사 정보 업데이트 API는 아직 구현되지 않았습니다.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        기업 정보 수정
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="companyName"
              label="기업명"
              name="companyName"
              value={companyData.companyName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="ceoName"
              label="대표자명"
              name="ceoName"
              value={companyData.ceoName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="businessNumber"
              label="사업자등록번호"
              name="businessNumber"
              value={companyData.businessNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              id="employeeCount"
              label="직원 수"
              name="employeeCount"
              value={companyData.employeeCount}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              id="address"
              label="주소"
              name="address"
              value={companyData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              id="websiteUrl"
              label="웹사이트 URL"
              name="websiteUrl"
              value={companyData.websiteUrl}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              id="description"
              label="기업 소개"
              name="description"
              value={companyData.description}
              onChange={handleChange}
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
