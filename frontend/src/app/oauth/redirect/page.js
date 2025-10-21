'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

// OAuth 리다이렉트 페이지 컴포넌트의 실제 내용
function OAuthRedirectContent() {
    const router = useRouter(); // Next.js 라우터
    const { login } = useAuthStore(); // 인증 스토어에서 로그인 함수 가져오기

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // 백엔드의 새로운 /api/auth/token 엔드포인트 호출 (토큰을 URL에서 제거했으므로 API 호출로 가져옴)
                const response = await fetch('/api/auth/token');
                if (!response.ok) {
                    throw new Error('Failed to fetch token');
                }
                const data = await response.json();
                const accessToken = data.accessToken;
                const refreshToken = data.refreshToken; // 리프레시 토큰 추출 (추가됨)

                if (accessToken && refreshToken) { // 두 토큰 모두 확인 (조건 변경됨)
                    // Zustand 스토어에 토큰 저장 (액세스 및 리프레시 토큰 모두 저장)
                    login(accessToken, refreshToken); // 두 토큰 모두 전달 (함수 시그니처 변경됨)
                    // 로그인 성공 후 메인 페이지로 리다이렉트
                    router.replace('/');
                } else {
                    console.error("OAuth 토큰을 찾을 수 없습니다.");
                    router.replace('/login');
                }
            } catch (error) {
                console.error("토큰을 가져오는 중 오류 발생:", error);
                router.replace('/login');
            }
        };

        fetchToken();
    }, [router, login]); // searchParams 의존성 제거됨

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