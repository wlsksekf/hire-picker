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
  Tab
} from '@mui/material';
import { getUserProfile, updateUserProfileDetails } from '@/api';
import AcademicInfoForm from './AcademicInfoForm';
import ExperienceInfoForm from './ExperienceInfoForm';
import MilitaryInfoForm from './MilitaryInfoForm';
import CertificationInfoForm from './CertificationInfoForm';

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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        내 정보 관리
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          <Tab label="기본정보" />
          <Tab label="학력" />
          <Tab label="경력" />
          <Tab label="병역" />
          <Tab label="자격증" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField label="이름" value={form.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth margin="normal" />
            <TextField label="닉네임" value={form.nickname} onChange={(e) => handleChange('nickname', e.target.value)} fullWidth margin="normal" />
            <TextField label="이메일" value={profile.email} fullWidth margin="normal" disabled />
            <TextField label="전화번호" value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} fullWidth margin="normal" />
            <TextField label="주소" value={form.address} onChange={(e) => handleChange('address', e.target.value)} fullWidth margin="normal" />
            <TextField select label="성별" value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} fullWidth margin="normal">
              <MenuItem value="">선택 안 함</MenuItem>
              <MenuItem value="MALE">남성</MenuItem>
              <MenuItem value="FEMALE">여성</MenuItem>
            </TextField>
            <TextField fullWidth name="password" label="새 비밀번호" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} margin="normal" helperText="비밀번호를 변경하지 않으면 비워두세요" />
            <TextField fullWidth name="confirmPassword" label="새 비밀번호 확인" type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} margin="normal" error={Boolean(passwordError)} helperText={passwordError || ''} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" type="submit" disabled={Boolean(passwordError)}>저장</Button>
            </Box>
          </Box>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <AcademicInfoForm />
        </Paper>
      )}
      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          <ExperienceInfoForm />
        </Paper>
      )}
      {tab === 3 && (
        <Paper sx={{ p: 3 }}>
          <MilitaryInfoForm />
        </Paper>
      )}
      {tab === 4 && (
        <Paper sx={{ p: 3 }}>
          <CertificationInfoForm />
        </Paper>
      )}
    </Container>
  );
}
