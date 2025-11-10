'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { MilitaryTech } from '@mui/icons-material';
import { getMilitary, saveMilitary } from '@/api';
import { StyledTextField, StyledButton } from './FormStyles';

export default function MilitaryInfoForm() {
  const [militaryInfo, setMilitaryInfo] = useState({
    serviceType: '',
    militaryBranch: '',
    militaryRank: '',
    enlistmentDate: '',
    dischargeDate: '',
    reasonForExemption: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadMilitary();
  }, []);

  async function loadMilitary() {
    try {
      setLoading(true);
      setError(null);
      const m = await getMilitary();
      if (m) {
        setMilitaryInfo({
          serviceType: m.serviceType || '',
          militaryBranch: m.militaryBranch || '',
          militaryRank: m.militaryRank || '',
          enlistmentDate: m.enlistmentDate || '',
          dischargeDate: m.dischargeDate || '',
          reasonForExemption: m.reasonForExemption || ''
        });
      }
    } catch (err) {
      console.error('병역 조회 실패:', err);
      setError('병역 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...militaryInfo, [name]: value };
    setMilitaryInfo(updated);
    
    // 실시간 유효성 검사
    validateMilitary(updated);
  }

  function validateMilitary(info) {
    const errors = {};
    
    // 병역 구분이 선택되었을 때만 추가 검증
    if (info.serviceType === '병역') {
      if (!info.militaryBranch || info.militaryBranch.trim() === '') {
        errors.militaryBranch = '병과를 입력해주세요.';
      }
      if (!info.militaryRank || info.militaryRank.trim() === '') {
        errors.militaryRank = '계급을 입력해주세요.';
      }
      if (!info.enlistmentDate) {
        errors.enlistmentDate = '입대일을 입력해주세요.';
      }
      if (!info.dischargeDate) {
        errors.dischargeDate = '전역일을 입력해주세요.';
      }
    } else if (info.serviceType === '면제') {
      if (!info.reasonForExemption || info.reasonForExemption.trim() === '') {
        errors.reasonForExemption = '면제사유를 입력해주세요.';
      }
    }
    
    setFieldErrors(errors);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // 유효성 검사 실행 및 에러 수집
      const errors = {};
      
      // 병역 구분이 선택되었을 때만 추가 검증
      if (militaryInfo.serviceType === '병역') {
        if (!militaryInfo.militaryBranch || militaryInfo.militaryBranch.trim() === '') {
          errors.militaryBranch = '병과를 입력해주세요.';
        }
        if (!militaryInfo.militaryRank || militaryInfo.militaryRank.trim() === '') {
          errors.militaryRank = '계급을 입력해주세요.';
        }
      if (!militaryInfo.enlistmentDate) {
        errors.enlistmentDate = '입대일을 입력해주세요.';
      }
      if (!militaryInfo.dischargeDate) {
        errors.dischargeDate = '전역일을 입력해주세요.';
        }
      } else if (militaryInfo.serviceType === '면제') {
        if (!militaryInfo.reasonForExemption || militaryInfo.reasonForExemption.trim() === '') {
          errors.reasonForExemption = '면제사유를 입력해주세요.';
        }
      }
      
      // 에러가 있으면 UI에 표시하고 저장 중단
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('입력한 정보를 확인해주세요.');
        return;
      }
      
      await saveMilitary(militaryInfo);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('병역 저장 실패:', err);
      setError(err.response?.data?.message || '병역 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MilitaryTech sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px', color: '#212121' }}>
          병역 정보
        </Typography>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: '12px' }} 
          onClose={() => setSuccess(false)}
        >
          병역 정보가 저장되었습니다.
        </Alert>
      )}

      <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #f0f0f0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ color: '#757575', mb: 2, display: 'block', fontWeight: 600 }}>
            병역 구분
          </Typography>
          <RadioGroup 
            row 
            name="serviceType" 
            value={militaryInfo.serviceType} 
            onChange={handleChange}
            sx={{ mb: 3 }}
          >
            <FormControlLabel 
              value="병역" 
              control={<Radio />} 
              label="병역" 
              sx={{ mr: 3 }}
            />
            <FormControlLabel 
              value="미필" 
              control={<Radio />} 
              label="미필" 
              sx={{ mr: 3 }}
            />
            <FormControlLabel 
              value="면제" 
              control={<Radio />} 
              label="면제" 
            />
          </RadioGroup>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                병과 {militaryInfo.serviceType === '병역' && '*'}
              </Typography>
              <StyledTextField 
                name="militaryBranch" 
                value={militaryInfo.militaryBranch} 
                onChange={handleChange}
                placeholder="병과를 입력하세요"
                fullWidth
                error={fieldErrors.militaryBranch ? true : false}
                helperText={fieldErrors.militaryBranch || ''}
                disabled={militaryInfo.serviceType !== '병역'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                계급 {militaryInfo.serviceType === '병역' && '*'}
              </Typography>
              <StyledTextField 
                name="militaryRank" 
                value={militaryInfo.militaryRank} 
                onChange={handleChange}
                placeholder="계급을 입력하세요"
                fullWidth
                error={fieldErrors.militaryRank ? true : false}
                helperText={fieldErrors.militaryRank || ''}
                disabled={militaryInfo.serviceType !== '병역'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                입대일 {militaryInfo.serviceType === '병역' && '*'}
              </Typography>
              <StyledTextField 
                name="enlistmentDate" 
                type="date"
                value={militaryInfo.enlistmentDate}
                onChange={handleChange}
                fullWidth
                error={Boolean(fieldErrors.enlistmentDate)}
                helperText={fieldErrors.enlistmentDate || ''}
                disabled={militaryInfo.serviceType !== '병역'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                전역일 {militaryInfo.serviceType === '병역' && '*'}
              </Typography>
              <StyledTextField 
                name="dischargeDate" 
                type="date"
                value={militaryInfo.dischargeDate}
                onChange={handleChange}
                fullWidth
                error={Boolean(fieldErrors.dischargeDate)}
                helperText={fieldErrors.dischargeDate || ''}
                disabled={militaryInfo.serviceType !== '병역'}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                면제사유 {militaryInfo.serviceType === '면제' && '*'}
              </Typography>
              <StyledTextField 
                name="reasonForExemption" 
                value={militaryInfo.reasonForExemption} 
                onChange={handleChange}
                placeholder="면제사유를 입력하세요"
                fullWidth
                multiline
                rows={3}
                error={fieldErrors.reasonForExemption ? true : false}
                helperText={fieldErrors.reasonForExemption || ''}
                disabled={militaryInfo.serviceType !== '면제'}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <StyledButton type="submit" variant="contained" disabled={saving}>
              {saving ? '저장 중...' : '저장하기'}
            </StyledButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
