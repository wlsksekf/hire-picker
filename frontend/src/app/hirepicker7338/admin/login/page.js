'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import useManageAuthStore from '../../../../store/manageAuthStore';
import { MINT_PRIMARY, MINT_PRIMARY_DARK } from '../adminTheme';

const AdminLoginPage = () => {
  const router = useRouter(); // 라우팅 처리를 위한 훅
  const login = useManageAuthStore((state) => state.login);
  const isLoading = useManageAuthStore((state) => state.isLoading);

  const [form, setForm] = useState({ id: '', password: '' }); // 입력값 상태
  const [error, setError] = useState(null); // 에러 메시지 상태

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value })); // 입력 변경 처리
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await login(form); // 스토어에 로그인 요청 위임
      router.push('/hirepicker7338/admin'); // 로그인 성공 시 대시보드로 이동
    } catch (err) {
      const message = err?.response?.data?.message || '로그인에 실패했습니다.';
      setError(message); // 에러 메시지 표시
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f6f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack spacing={4} alignItems="center" maxWidth={520} width="100%">
        <Box textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1f2937',
              boxShadow: '0 14px 24px rgba(17,24,39,0.08)',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight={700} color="#fff">
              HP
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>
            HirePicker Admin
          </Typography>
          <Typography variant="body2" color={MINT_PRIMARY_DARK}>
            관리자 콘솔에 로그인하세요
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 3,
            p: 4.5,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(17,24,39,0.06)',
            boxShadow: '0 10px 18px -14px rgba(15,23,42,0.15)',
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              관리자 로그인
            </Typography>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#ef4444',
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              name="id"
              label="아이디"
              placeholder="관리자 아이디를 입력하세요"
              value={form.id}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: MINT_PRIMARY,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: MINT_PRIMARY_DARK,
                  },
                },
              }}
            />

            <TextField
              name="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: MINT_PRIMARY,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: MINT_PRIMARY_DARK,
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                backgroundColor: MINT_PRIMARY_DARK,
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(15,118,110,0.25)',
                '&:hover': {
                  backgroundColor: MINT_PRIMARY_DARK,
                  boxShadow: '0 6px 16px rgba(15,118,110,0.35)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.2s ease',
              }}
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default AdminLoginPage;

