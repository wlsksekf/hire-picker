'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  CircularProgress,
  Alert,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getUserProfile, updateUserProfileDetails } from '@/api';
import AcademicInfoForm from './AcademicInfoForm';
import ExperienceInfoForm from './ExperienceInfoForm';
import MilitaryInfoForm from './MilitaryInfoForm';
import CertificationInfoForm from './CertificationInfoForm';

// 토스/당근 스타일 카드
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: '1px solid #f0f0f0',
  marginBottom: '24px',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    transition: 'box-shadow 0.2s ease-in-out'
  }
}));

// 토스/당근 스타일 탭
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: '3px',
    borderRadius: '3px 3px 0 0'
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 500,
    minHeight: '56px',
    padding: '0 24px',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600
    }
  }
}));

// 토스/당근 스타일 입력 필드
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#e0e0e0'
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px'
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main
  }
}));

// 토스/당근 스타일 버튼
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  height: '48px',
  padding: '0 24px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  }
}));

// 개인 마이페이지 - 내 정보 관리
export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    nickname: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    gender: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [tab, setTab] = useState(0); // 0 기본정보, 1 학력, 2 경력, 3 병역, 4 자격증

  useEffect(() => {
    getUserProfile()
      .then((userData) => {
        setProfile({
          name: userData.name || '',
          nickname: userData.nickname || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          gender: userData.gender || ''
        });
        setForm((prev) => ({
          ...prev,
          name: userData.name || '',
          nickname: userData.nickname || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          gender: userData.gender || ''
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('사용자 정보 조회 실패:', err);
        setError('사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
        setLoading(false);
      });
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다');
      return;
    }
    setPasswordError('');

    const payload = {
      name: form.name,
      nickname: form.nickname,
      password: form.password || undefined,
      phoneNumber: form.phoneNumber,
      address: form.address,
      gender: form.gender
    };
    await updateUserProfileDetails(payload);
    alert('기본정보가 저장되었습니다.');
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '60vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="md">
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            fontSize: '28px',
            color: '#212121',
            mb: 3
          }}
        >
          내 정보 관리
        </Typography>

        <StyledCard>
          <StyledTabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <Tab label="기본정보" />
            <Tab label="학력" />
            <Tab label="경력" />
            <Tab label="병역" />
            <Tab label="자격증" />
          </StyledTabs>
        </StyledCard>

        {tab === 0 && (
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <StyledTextField 
                    label="이름" 
                    value={form.name} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    fullWidth 
                  />
                  <StyledTextField 
                    label="닉네임" 
                    value={form.nickname} 
                    onChange={(e) => handleChange('nickname', e.target.value)} 
                    fullWidth 
                  />
                  <StyledTextField 
                    label="이메일" 
                    value={profile.email} 
                    fullWidth 
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  />
                  <StyledTextField 
                    label="전화번호" 
                    value={form.phoneNumber} 
                    onChange={(e) => handleChange('phoneNumber', e.target.value)} 
                    fullWidth 
                  />
                  <StyledTextField 
                    label="주소" 
                    value={form.address} 
                    onChange={(e) => handleChange('address', e.target.value)} 
                    fullWidth 
                  />
                  <StyledTextField 
                    select 
                    label="성별" 
                    value={form.gender} 
                    onChange={(e) => handleChange('gender', e.target.value)} 
                    fullWidth
                  >
                    <MenuItem value="">선택 안 함</MenuItem>
                    <MenuItem value="MALE">남성</MenuItem>
                    <MenuItem value="FEMALE">여성</MenuItem>
                  </StyledTextField>
                  <StyledTextField 
                    fullWidth 
                    name="password" 
                    label="새 비밀번호" 
                    type="password" 
                    value={form.password} 
                    onChange={(e) => handleChange('password', e.target.value)} 
                    helperText="비밀번호를 변경하지 않으면 비워두세요"
                  />
                  <StyledTextField 
                    fullWidth 
                    name="confirmPassword" 
                    label="새 비밀번호 확인" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={(e) => handleChange('confirmPassword', e.target.value)} 
                    error={Boolean(passwordError)} 
                    helperText={passwordError || ''} 
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <StyledButton 
                      variant="contained" 
                      color="primary" 
                      type="submit" 
                      disabled={Boolean(passwordError)}
                    >
                      저장하기
                    </StyledButton>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        )}

        {tab === 1 && (
          <StyledCard>
            <CardContent sx={{ p: 0 }}>
              <AcademicInfoForm />
            </CardContent>
          </StyledCard>
        )}
        {tab === 2 && (
          <StyledCard>
            <CardContent sx={{ p: 0 }}>
              <ExperienceInfoForm />
            </CardContent>
          </StyledCard>
        )}
        {tab === 3 && (
          <StyledCard>
            <CardContent sx={{ p: 0 }}>
              <MilitaryInfoForm />
            </CardContent>
          </StyledCard>
        )}
        {tab === 4 && (
          <StyledCard>
            <CardContent sx={{ p: 0 }}>
              <CertificationInfoForm />
            </CardContent>
          </StyledCard>
        )}
      </Container>
    </Box>
  );
}
