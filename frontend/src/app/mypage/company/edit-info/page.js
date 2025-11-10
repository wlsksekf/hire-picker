'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { api } from '@/api';

/**
 * 기업 정보 수정 페이지
 *
 * 기능:
 * 1. 로그인한 기업회원의 회사 정보 불러오기 (GET /api/companies/my)
 * 2. 회사 정보 수정 (TODO: 업데이트 API 구현)
 * 3. 수정된 정보 저장 (TODO: 업데이트 API 구현)
 *
 * 참고: 개인회원 정보 수정과 동일한 패턴 사용
 */
export default function EditCompanyInfo() {
  const [companyData, setCompanyData] = useState({
    companyName: '',
    ceoName: '',
    address: '',
    description: '',
    businessNumber: '',
    websiteUrl: '',
    employeeCount: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // 저장 중 상태 추가
  const [error, setError] = useState(null);

  // 회사 정보 불러오기 (마운트 시 단 한 번만!)
  useEffect(() => {
    console.log('[EditCompanyInfo] API 호출 시작');

    api.get('/api/companies/my')
      .then(response => {
        console.log('[EditCompanyInfo] API 응답:', response.data);

        // 실제 회사 정보인지 확인
        if (!response.data.companyIdx && !response.data.companyName) {
          console.error('[EditCompanyInfo] 잘못된 응답:', response.data);
          setError('회사 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }

        console.log('[EditCompanyInfo] 회사 정보 로드 성공');
        setCompanyData({
          companyName: response.data.companyName || '',
          ceoName: response.data.ceoName || '',
          address: response.data.address || '',
          description: response.data.description || '',
          businessNumber: response.data.businessNumber || '',
          websiteUrl: response.data.websiteUrl || '',
          employeeCount: response.data.employeeCount || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('[EditCompanyInfo] 회사 정보 로드 실패:', err);
        const errorMsg = err.response?.data?.message || '회사 정보를 불러오는데 실패했습니다.';
        setError(errorMsg);
        setLoading(false);
      });
  }, []); // 빈 배열! 개인회원 페이지와 동일한 패턴

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[EditCompanyInfo] 저장 버튼 클릭, 데이터:', companyData);

    // 저장 중 상태로 변경
    setSaving(true);
    setError(null);

    // PUT 요청으로 회사 정보 업데이트
    api.put('/api/companies/my', companyData)
      .then(response => {
        console.log('[EditCompanyInfo] 업데이트 성공:', response.data);

        // 업데이트된 정보로 상태 갱신
        setCompanyData({
          companyName: response.data.companyName || '',
          ceoName: response.data.ceoName || '',
          address: response.data.address || '',
          description: response.data.description || '',
          businessNumber: response.data.businessNumber || '',
          websiteUrl: response.data.websiteUrl || '',
          employeeCount: response.data.employeeCount || '',
        });

        setSaving(false);
        alert('회사 정보가 성공적으로 업데이트되었습니다!');
      })
      .catch(err => {
        console.error('[EditCompanyInfo] 업데이트 실패:', err);
        const errorMsg = err.response?.data?.message || '회사 정보 업데이트에 실패했습니다.';
        setError(errorMsg);
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>회사 정보를 불러오는 중...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        기업 정보 수정
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

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
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {saving ? '저장 중...' : '정보 저장'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
