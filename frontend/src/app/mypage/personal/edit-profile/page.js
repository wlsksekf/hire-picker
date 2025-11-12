'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getUserProfile, updateUserProfileDetails, getCreditBalance, getMyResumes } from '@/api';
import AcademicInfoForm from './AcademicInfoForm';
import ExperienceInfoForm from './ExperienceInfoForm';
import MilitaryInfoForm from './MilitaryInfoForm';
import CertificationInfoForm from './CertificationInfoForm';

// 당근 느낌의 배경과 카드 레이아웃을 구성한다.
const PageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  minHeight: '100vh',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
}));

const ProfileBanner = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: '#f5f5f5',
  color: '#1a1a1a',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
}));

const ProfileAvatar = styled(Avatar)(() => ({
  width: 76,
  height: 76,
  backgroundColor: '#e0e0e0',
  fontSize: '28px',
  fontWeight: 700,
}));

const SectionGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0 16px 32px rgba(10, 10, 10, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backgroundColor: '#ffffff',
}));

// 부드러운 입력 필드 스타일을 유지한다.
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

// 저장 버튼도 동일한 톤으로 정리한다.
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  height: '48px',
  padding: '0 24px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

function normalizeGenderDisplay(rawGender) {
  if (rawGender === undefined || rawGender === null) return '';
  const trimmed = String(rawGender).trim();
  if (!trimmed) return '';
  const upper = trimmed.toUpperCase();
  if (upper === 'MALE' || upper === 'M') return '남성';
  if (upper === 'FEMALE' || upper === 'F') return '여성';
  if (trimmed === '남' || trimmed === '남자') return '남성';
  if (trimmed === '여' || trimmed === '여자') return '여성';
  return trimmed;
}

function normalizeBirthdate(value) {
  if (value === undefined || value === null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  const sanitized = trimmed.replace(/\./g, '-').replace(/\//g, '-');
  const match = sanitized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return sanitized;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// 개인 마이페이지 - 내 정보 관리
export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    nickname: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    birthdate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [credit, setCredit] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    gender: '',
    birthdate: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    getUserProfile()
      .then((userData) => {
        const normalizedGender = normalizeGenderDisplay(userData.gender);
        const normalizedBirthdate = normalizeBirthdate(userData.birthdate ?? userData.birthDate);
        setProfile({
          name: userData.name || '',
          nickname: userData.nickname || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          gender: normalizedGender,
          birthdate: normalizedBirthdate,
        });
        setForm((prev) => ({
          ...prev,
          name: userData.name || '',
          nickname: userData.nickname || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          gender: normalizedGender,
          birthdate: normalizedBirthdate,
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('사용자 정보 조회 실패:', err);
        setError('사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // 마이페이지 상단에 노출할 크레딧을 조회한다.
    getCreditBalance()
      .then((balance) => setCredit(Number.isFinite(balance) ? balance : 0))
      .catch((err) => {
        console.error('크레딧 조회 실패:', err);
        setCredit(0);
      });
  }, []);

  useEffect(() => {
    // 최신 이력서의 프로필 이미지를 가져온다.
    getMyResumes()
      .then((resumes) => {
        if (!Array.isArray(resumes) || resumes.length === 0) return;
        // 수정일을 기준으로 최신 순 정렬 후 이미지가 있는 항목을 찾는다.
        const sorted = [...resumes].sort((a, b) => {
          const dateA = a?.modifiedDate ? new Date(a.modifiedDate).getTime() : 0;
          const dateB = b?.modifiedDate ? new Date(b.modifiedDate).getTime() : 0;
          return dateB - dateA;
        });
        const resumeWithImage = sorted.find((resume) => Boolean(resume?.imageUrl));
        if (resumeWithImage?.imageUrl) {
          setProfileImage(resumeWithImage.imageUrl);
        } else if (sorted[0]?.imageUrl) {
          setProfileImage(sorted[0].imageUrl);
        }
      })
      .catch((err) => {
        console.error('이력서 이미지 조회 실패:', err);
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

    const sanitizedBirthdate = normalizeBirthdate(form.birthdate);
    const payload = {
      name: form.name,
      nickname: form.nickname,
      password: form.password || undefined,
      phoneNumber: form.phoneNumber,
      address: form.address,
      gender: form.gender,
      birthdate: sanitizedBirthdate || undefined,
    };
    await updateUserProfileDetails(payload);
    alert('기본정보가 저장되었습니다.');
  }

  const profileInitial =
    (profile.nickname && profile.nickname.charAt(0)) ||
    (profile.name && profile.name.charAt(0)) ||
    '유';

  if (loading) {
    return (
      <PageWrapper>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: '16px' }}>
            {error}
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <ProfileBanner>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ProfileAvatar src={profileImage || profile.profileImageUrl || undefined}>
              {profileInitial}
            </ProfileAvatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                {profile.nickname || profile.name || '회원님'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
                {profile.email || '이메일 정보가 없습니다'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  보유 크레딧
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                  {credit.toLocaleString()}P
                </Typography>
              </Box>
            </Box>
          </Box>
        </ProfileBanner>

        <SectionGroup>
          <SectionCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                기본정보
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 4 }}>
                연락처, 주소, 비밀번호 등을 최신으로 유지하세요.
              </Typography>
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
                        backgroundColor: '#f5f5f5',
                      },
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
                    label="성별"
                    value={form.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    placeholder="남성 / 여성"
                    fullWidth
                  />
                  <StyledTextField
                    label="생년월일"
                    value={form.birthdate}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                    placeholder="YYYY-MM-DD"
                    fullWidth
                  />
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
          </SectionCard>

          <SectionCard>
            <CardContent sx={{ p: 0 }}>
              <AcademicInfoForm />
            </CardContent>
          </SectionCard>

          <SectionCard>
            <CardContent sx={{ p: 0 }}>
              <ExperienceInfoForm />
            </CardContent>
          </SectionCard>

          <SectionCard>
            <CardContent sx={{ p: 0 }}>
              <MilitaryInfoForm />
            </CardContent>
          </SectionCard>

          <SectionCard>
            <CardContent sx={{ p: 0 }}>
              <CertificationInfoForm />
            </CardContent>
          </SectionCard>
        </SectionGroup>
      </Container>
    </PageWrapper>
  );
}
