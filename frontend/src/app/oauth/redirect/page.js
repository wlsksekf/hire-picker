'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

// OAuth 리다이렉트 페이지 컴포넌트의 실제 내용
function OAuthRedirectContent() {
    const searchParams = useSearchParams(); // URL 쿼리 파라미터
    const router = useRouter(); // Next.js 라우터
    const { login } = useAuthStore(); // 인증 스토어에서 로그인 함수 가져오기

    useEffect(() => {
        const token = searchParams.get('token'); // URL에서 토큰 추출

        if (token) {
            // Zustand 스토어에 토큰 저장
            login(token);
            // 로그인 성공 후 메인 페이지로 리다이렉트
            router.replace('/');
        } else {
            // 토큰이 없는 경우, 에러 메시지를 보여주거나 로그인 페이지로 리다이렉트
            console.error("OAuth 토큰을 찾을 수 없습니다.");
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

// OAuth 리다이렉트 페이지 (Suspense로 래핑)
export default function OAuthRedirectPage() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <OAuthRedirectContent />
        </Suspense>
    );
}