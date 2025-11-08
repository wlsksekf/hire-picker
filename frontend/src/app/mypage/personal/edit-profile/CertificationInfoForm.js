'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, WorkspacePremium } from '@mui/icons-material';
import { getCertifications, saveCertifications, searchCertifications } from '@/api';
import Autocomplete from '@mui/material/Autocomplete';
import { StyledCard, StyledTextField, StyledButton } from './FormStyles';

export default function CertificationInfoForm() {
  const [certifications, setCertifications] = useState([]);
  const [errors, setErrors] = useState(new Map()); // 각 행별 에러 메시지
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);

  // 초기 로드: 자격증 조회
  useEffect(() => {
    loadCertifications();
  }, []);

  async function loadCertifications() {
    try {
      setLoading(true);
      setError(null);
      const list = await getCertifications();
      const mapped = (list || []).map((c, idx) => ({
        id: idx + 1,
        certIdx: c.certIdx,
        certName: c.certName || ''
      }));
      setCertifications(mapped);
    } catch (err) {
      console.error('자격증 조회 실패:', err);
      setError('자격증 정보를 불러오지 못했습니다.');
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddRow() {
    setCertifications([...certifications, { id: Date.now(), certIdx: null, certName: '' }]);
  }

  function handleRemoveRow(id) {
    setCertifications(certifications.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    const updated = certifications.map(item => (item.id === id ? { ...item, [name]: value } : item));
    setCertifications(updated);
    
    // 실시간 유효성 검사
    const cert = updated.find(item => item.id === id);
    if (cert) {
      validateCertification(cert, id);
    }
  }

  function validateCertification(cert, id) {
    const newErrors = new Map(errors);
    const fieldErrors = {};

    // 자격증명이 입력되었지만 너무 짧으면 경고
    if (cert.certName && cert.certName.trim().length > 0 && cert.certName.trim().length < 2) {
      fieldErrors.certName = '자격증명은 2자 이상 입력해주세요.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      newErrors.set(id, fieldErrors);
    } else {
      newErrors.delete(id);
    }
    setErrors(newErrors);
  }

  async function handleSearchCertification(inputValue, id) {
    if (!inputValue || inputValue.length < 2) {
      setSearchOptions([]);
      return;
    }
    try {
      const results = await searchCertifications(inputValue);
      setSearchOptions(results || []);
    } catch (err) {
      console.error('자격증 검색 실패:', err);
      setSearchOptions([]);
    }
  }

  function handleCertificationSelect(option, id) {
    if (option && option.certIdx) {
      const e1 = { target: { name: 'certIdx', value: String(option.certIdx) } };
      const e2 = { target: { name: 'certName', value: option.certName } };
      handleChange(e1, id);
      handleChange(e2, id);
    }
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // 모든 항목에 대해 유효성 검사 실행 및 에러 수집
      const allErrors = new Map();
      certifications.forEach(cert => {
        const fieldErrors = {};
        
        // 자격증명이 입력되었지만 너무 짧으면 경고
        if (cert.certName && cert.certName.trim().length > 0 && cert.certName.trim().length < 2) {
          fieldErrors.certName = '자격증명은 2자 이상 입력해주세요.';
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          allErrors.set(cert.id, fieldErrors);
        }
      });

      // 에러가 있으면 UI에 표시하고 저장 중단
      if (allErrors.size > 0) {
        setErrors(allErrors);
        setError('입력한 정보를 확인해주세요.');
        return;
      }

      // 자격증명 목록 추출
      const certNameList = certifications
        .filter(c => c.certName && c.certName.trim())
        .map(c => c.certName.trim());

      if (certNameList.length === 0) {
        // 빈 목록도 저장 가능 (모두 삭제)
        await saveCertifications({ certNameList: [] });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      await saveCertifications({ certNameList });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // 저장 후 다시 조회
      await loadCertifications();
    } catch (err) {
      console.error('자격증 저장 실패:', err);
      setError(err.response?.data?.message || '자격증 정보 저장에 실패했습니다.');
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
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WorkspacePremium sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px', color: '#212121' }}>
          자격증 정보
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
          자격증 정보가 저장되었습니다.
        </Alert>
      )}

      {certifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#9e9e9e' }}>
          <WorkspacePremium sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography>등록된 자격증이 없습니다.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {certifications.map((cert, index) => (
            <StyledCard key={cert.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#757575', fontWeight: 600 }}>
                    자격증 {index + 1}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleRemoveRow(cert.id)}
                    sx={{ 
                      color: '#f44336',
                      '&:hover': { backgroundColor: '#ffebee' }
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                  자격증명
                </Typography>
                <Autocomplete
                  freeSolo
                  value={cert.certName}
                  onInputChange={(_, val) => {
                    handleChange({ target: { name: 'certName', value: val } }, cert.id);
                    handleSearchCertification(val, cert.id);
                  }}
                  onChange={(_, option) => {
                    handleCertificationSelect(option, cert.id);
                  }}
                  options={searchOptions}
                  getOptionLabel={(o) => (typeof o === 'string' ? o : o.certName || '')}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      placeholder="자격증명을 입력하거나 검색하세요"
                      fullWidth
                      error={errors.get(cert.id)?.certName ? true : false}
                      helperText={errors.get(cert.id)?.certName || ''}
                    />
                  )}
                />
              </CardContent>
            </StyledCard>
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
        <StyledButton 
          variant="outlined" 
          startIcon={<AddCircleOutline />} 
          onClick={handleAddRow}
          sx={{ 
            borderColor: '#e0e0e0',
            color: '#212121',
            '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
          }}
        >
          자격증 추가
        </StyledButton>
        <StyledButton 
          variant="contained" 
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장하기'}
        </StyledButton>
      </Box>
    </Box>
  );
}
