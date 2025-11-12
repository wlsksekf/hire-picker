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
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack spacing={4} alignItems="center" maxWidth={520} width="100%">
        <Box textAlign="center" color="#fff">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            HirePicker Admin
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Modernize Next.js 템플릿을 참고한 관리자 콘솔입니다.
          </Typography>
        </Box>

        <Paper
          elevation={12}
          sx={{
            width: '100%',
            borderRadius: 4,
            p: 4,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Typography variant="h5" fontWeight={600}>
              관리자 로그인
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
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
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ py: 1.4 }}
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

