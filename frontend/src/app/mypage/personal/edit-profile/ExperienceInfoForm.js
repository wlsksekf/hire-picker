'use client';

import React, { useEffect, useState } from 'react';
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
  Grid,
  Divider,
  Collapse
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, KeyboardArrowDown, KeyboardArrowUp, Work } from '@mui/icons-material';
import { getExperiences, saveExperiences } from '@/api';
import { StyledCard, StyledTextField, StyledButton } from './FormStyles';

function ExpandableCard({ exp, index, onRemove, onChange, errors }) {
  const [open, setOpen] = useState(false);

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#757575', fontWeight: 600 }}>
            경력 {index + 1}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setOpen(!open)}
              sx={{ 
                color: '#757575',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onRemove(exp.id)}
              sx={{ 
                color: '#f44336',
                '&:hover': { backgroundColor: '#ffebee' }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              회사명 *
            </Typography>
            <StyledTextField
              name="companyName"
              value={exp.companyName}
              onChange={e => onChange(e, exp.id)}
              placeholder="회사명을 입력하세요"
              fullWidth
              error={errors.get(exp.id)?.companyName ? true : false}
              helperText={errors.get(exp.id)?.companyName || ''}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              부서
            </Typography>
            <StyledTextField
              name="department"
              value={exp.department}
              onChange={e => onChange(e, exp.id)}
              placeholder="부서를 입력하세요"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              직책
            </Typography>
            <StyledTextField
              name="position"
              value={exp.position}
              onChange={e => onChange(e, exp.id)}
              placeholder="직책을 입력하세요"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              주요 직무
            </Typography>
            <StyledTextField
              name="mainDuties"
              value={exp.mainDuties}
              onChange={e => onChange(e, exp.id)}
              placeholder="예: 백엔드 개발 / 고객 상담 지원"
              fullWidth
              inputProps={{ maxLength: 20 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              입사일 *
            </Typography>
            <StyledTextField
              name="hireDate"
              type="date"
              value={exp.hireDate}
              onChange={e => onChange(e, exp.id)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={errors.get(exp.id)?.hireDate ? true : false}
              helperText={errors.get(exp.id)?.hireDate || ''}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
              퇴사일
            </Typography>
            <StyledTextField
              name="resignDate"
              type="date"
              value={exp.resignDate}
              onChange={e => onChange(e, exp.id)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={errors.get(exp.id)?.resignDate ? true : false}
              helperText={errors.get(exp.id)?.resignDate || ''}
            />
          </Grid>
        </Grid>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" sx={{ color: '#757575', mb: 2, fontWeight: 600 }}>
              상세 정보
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                  상세 업무 내용
                </Typography>
                <StyledTextField
                  name="jobDescription"
                  value={exp.jobDescription}
                  onChange={e => onChange(e, exp.id)}
                  placeholder="상세 업무 내용을 입력하세요"
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </StyledCard>
  );
}

export default function ExperienceInfoForm() {
  const [experiences, setExperiences] = useState([]);
  const [errors, setErrors] = useState(new Map()); // 각 행별 에러 메시지
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadExperiences();
  }, []);

  async function loadExperiences() {
    try {
      setLoading(true);
      setError(null);
      const list = await getExperiences();
      const mapped = (list || []).map((e, idx) => ({
        id: idx + 1,
        companyName: e.companyName || '',
        department: e.department || '',
        position: e.position || '',
        hireDate: e.hireDate || '',
        resignDate: e.resignDate || '',
        jobDescription: e.jobDescription || '',
        mainDuties: e.mainDuties || ''
      }));
      setExperiences(mapped);
    } catch (err) {
      console.error('경력 조회 실패:', err);
      setError('경력 정보를 불러오지 못했습니다.');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddRow() {
    setExperiences([...experiences, { id: Date.now(), companyName: '', department: '', position: '', hireDate: '', resignDate: '', jobDescription: '', mainDuties: '' }]);
  }

  function handleRemoveRow(id) {
    setExperiences(experiences.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    const updated = experiences.map(item => (item.id === id ? { ...item, [name]: value } : item));
    setExperiences(updated);
    
    // 실시간 유효성 검사
    const exp = updated.find(item => item.id === id);
    if (exp) {
      validateExperience(exp, id);
    }
  }

  function validateExperience(exp, id) {
    const newErrors = new Map(errors);
    const fieldErrors = {};

    // 회사명 검증
    if (!exp.companyName || exp.companyName.trim() === '') {
      fieldErrors.companyName = '회사명을 입력해주세요.';
    }

    // 입사일 검증
    if (!exp.hireDate || exp.hireDate.trim() === '') {
      fieldErrors.hireDate = '입사일을 입력해주세요.';
    }

    // 퇴사일이 입사일보다 이전이면 안됨
    if (exp.hireDate && exp.resignDate) {
      const hire = new Date(exp.hireDate);
      const resign = new Date(exp.resignDate);
      if (resign < hire) {
        fieldErrors.resignDate = '퇴사일은 입사일보다 이후여야 합니다.';
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      newErrors.set(id, fieldErrors);
    } else {
      newErrors.delete(id);
    }
    setErrors(newErrors);
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // 모든 항목에 대해 유효성 검사 실행 및 에러 수집
      const allErrors = new Map();
      experiences.forEach(exp => {
        const fieldErrors = {};

        // 회사명 검증
        if (!exp.companyName || exp.companyName.trim() === '') {
          fieldErrors.companyName = '회사명을 입력해주세요.';
        }

        // 입사일 검증
        if (!exp.hireDate || exp.hireDate.trim() === '') {
          fieldErrors.hireDate = '입사일을 입력해주세요.';
        }

        // 퇴사일이 입사일보다 이전이면 안됨
        if (exp.hireDate && exp.resignDate) {
          const hire = new Date(exp.hireDate);
          const resign = new Date(exp.resignDate);
          if (resign < hire) {
            fieldErrors.resignDate = '퇴사일은 입사일보다 이후여야 합니다.';
          }
        }

        if (Object.keys(fieldErrors).length > 0) {
          allErrors.set(exp.id, fieldErrors);
        }
      });

      // 에러가 있으면 UI에 표시하고 저장 중단
      if (allErrors.size > 0) {
        setErrors(allErrors);
        setError('입력한 정보를 확인해주세요.');
        return;
      }

      // 필수 필드 검증
      const invalidItems = experiences.filter(e => !e.companyName || !e.hireDate);
      if (invalidItems.length > 0) {
        setError('회사명과 입사일은 필수 입력 항목입니다.');
        return;
      }

      const payload = experiences
        .filter(e => e.companyName && e.hireDate) // 유효한 항목만
        .map(e => ({
          companyName: e.companyName,
          department: e.department || null,
          position: e.position || null,
          hireDate: e.hireDate || null,
          resignDate: e.resignDate || null,
          jobDescription: e.jobDescription || null,
          mainDuties: e.mainDuties || null,
        }));

      await saveExperiences(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadExperiences(); // 저장 후 다시 조회
    } catch (err) {
      console.error('경력 저장 실패:', err);
      setError(err.response?.data?.message || '경력 정보 저장에 실패했습니다.');
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
        <Work sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px', color: '#212121' }}>
          경력 정보
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
          경력 정보가 저장되었습니다.
        </Alert>
      )}

      {experiences.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#9e9e9e' }}>
          <Work sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography>등록된 경력 정보가 없습니다.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {experiences.map((exp, index) => (
            <ExpandableCard 
              key={exp.id} 
              exp={exp} 
              index={index}
              onRemove={handleRemoveRow} 
              onChange={handleChange}
              errors={errors}
            />
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
          경력 추가
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
