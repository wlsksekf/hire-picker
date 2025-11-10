'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  AddCircleOutline,
  DeleteOutline,
  WorkspacePremium,
  LocalOffer,
} from '@mui/icons-material';
import { getCertifications, saveCertifications, searchCertifications, getMyResumes } from '@/api';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { StyledCard, StyledButton } from './FormStyles';
import debounce from 'lodash/debounce';

export default function CertificationInfoForm() {
  const [certifications, setCertifications] = useState([]);
  const [errors, setErrors] = useState(new Map()); // 각 행별 에러 메시지
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [targetResumeId, setTargetResumeId] = useState(null);
  const [resumeNotice, setResumeNotice] = useState(null);

  // 초기 로드: 자격증 조회
  useEffect(() => {
    loadCertifications();
  }, []);

  useEffect(() => {
    (async function resolveResumeTarget() {
      try {
        const list = await getMyResumes();
        const resumes = Array.isArray(list) ? list : [];
        if (resumes.length === 0) {
          setResumeNotice('자격증을 저장하려면 먼저 이력서를 작성해주세요.');
          setTargetResumeId(null);
          return;
        }
        const sorted = [...resumes].sort((a, b) => {
          const timeA = a.modifiedDate ? new Date(a.modifiedDate).getTime() : 0;
          const timeB = b.modifiedDate ? new Date(b.modifiedDate).getTime() : 0;
          if (timeA === timeB) {
            const idA = a.id ?? a.resumeIdx ?? 0;
            const idB = b.id ?? b.resumeIdx ?? 0;
            return idB - idA;
          }
          return timeB - timeA;
        });
        const chosen = sorted[0];
        setResumeNotice(null);
        setTargetResumeId(chosen?.id ?? chosen?.resumeIdx ?? null);
      } catch (err) {
        console.error('이력서 목록 조회 실패:', err);
        setResumeNotice('이력서 정보를 불러오지 못했습니다. 새로고침 후 다시 시도하세요.');
        setTargetResumeId(null);
      }
    })();
  }, []);

  async function loadCertifications() {
    try {
      setLoading(true);
      setError(null);
      const list = await getCertifications();
      const normalized = Array.isArray(list) ? list : [];
      const mapped = normalized.map((c, idx) => ({
        id: idx + 1,
        certIdx: c.certIdx,
        certName: c.certName || '',
        isRegistered: true,
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
    setCertifications([
      ...certifications,
      { id: Date.now(), certIdx: null, certName: '', isRegistered: false },
    ]);
  }

  function handleRemoveRow(id) {
    setCertifications(certifications.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    const updated = certifications.map(item => {
      if (item.id !== id) return item;
      if (name === 'certName') {
        return {
          ...item,
          certName: value,
          certIdx: null,
          isRegistered: false,
        };
      }
      return { ...item, [name]: value };
    });
    setCertifications(updated);

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

  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
          setSearchOptions([]);
          setSearchLoading(false);
          return;
        }
        try {
          setSearchLoading(true);
          const results = await searchCertifications(inputValue);
          setSearchOptions(results || []);
        } catch (err) {
          console.error('자격증 검색 실패:', err);
          setSearchOptions([]);
        } finally {
          setSearchLoading(false);
        }
      }, 250),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  function handleCertificationSelect(option, id) {
    if (!option) return;
    const updated = certifications.map(item => {
      if (item.id !== id) return item;
      if (typeof option === 'string') {
        return {
          ...item,
          certName: option,
          certIdx: null,
          isRegistered: false,
        };
      }
      return {
        ...item,
        certName: option.certName,
        certIdx: option.certIdx ? String(option.certIdx) : null,
        isRegistered: Boolean(option.certIdx),
      };
    });
    setCertifications(updated);
    const cert = updated.find(item => item.id === id);
    if (cert) {
      validateCertification(cert, id);
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
      const certIdxList = certifications
        .filter(c => c.certIdx)
        .map(c => Number(c.certIdx));
      const certNameList = certifications
        .filter(c => !c.certIdx && c.certName && c.certName.trim())
        .map(c => c.certName.trim());

      if (!targetResumeId) {
        setError('자격증을 저장할 이력서를 찾을 수 없습니다. 기본 이력서를 먼저 등록해주세요.');
        return;
      }

      if (certIdxList.length === 0 && certNameList.length === 0) {
        await saveCertifications({ resumeIdx: targetResumeId, certIdxList: [], certNameList: [] });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      await saveCertifications({ resumeIdx: targetResumeId, certIdxList, certNameList });
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

      {resumeNotice && (
        <Alert
          severity={targetResumeId ? 'info' : 'warning'}
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setResumeNotice(null)}
        >
          {resumeNotice}
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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" sx={{ color: '#757575', fontWeight: 600 }}>
                      자격증 {index + 1}
                    </Typography>
                    {cert.isRegistered && (
                      <Tooltip title="기존에 등록된 자격증">
                        <Chip
                          size="small"
                          label="등록됨"
                          color="primary"
                          icon={<LocalOffer fontSize="inherit" />}
                          sx={{ height: 22 }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
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
                  loading={searchLoading}
                  onInputChange={(_, val, reason) => {
                    if (reason === 'input') {
                      handleChange({ target: { name: 'certName', value: val } }, cert.id);
                      debouncedSearch(val);
                    } else if (reason === 'clear') {
                      handleChange({ target: { name: 'certName', value: '' } }, cert.id);
                      setSearchOptions([]);
                    }
                  }}
                  onChange={(_, option) => {
                    handleCertificationSelect(option, cert.id);
                  }}
                  options={searchOptions}
                  getOptionLabel={(o) => (typeof o === 'string' ? o : o.certName || '')}
                  loadingText="검색 중..."
                  noOptionsText="검색 결과가 없습니다"
                  renderOption={(props, option) => {
                    const label = typeof option === 'string' ? option : option.certName || '';
                    const code = typeof option === 'string' ? null : option.certIdx;
                    const { key, ...restProps } = props;
                    return (
                      <Box
                        key={key}
                        component="li"
                        {...restProps}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                      >
                        <Typography>{label}</Typography>
                        {code && (
                          <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                            코드 #{code}
                          </Typography>
                        )}
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="자격증명을 입력하거나 검색하세요"
                      fullWidth
                      error={Boolean(errors.get(cert.id)?.certName)}
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
