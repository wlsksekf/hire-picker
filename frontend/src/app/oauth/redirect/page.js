'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

export default function OAuthRedirectPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Zustand 스토어에 토큰 저장
            login(token);
            // 로그인 성공 후 메인 페이지로 리다이렉트
            router.replace('/');
        } else {
            // 토큰이 없는 경우, 에러 메시지를 보여주거나 로그인 페이지로 리다이렉트
            console.error("OAuth token not found.");
            router.replace('/login');
        }
    }, [searchParams, router, login]);

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                }}
            >
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>로그인 중입니다...</Typography>
            </Box>
        </Container>
    );
}
