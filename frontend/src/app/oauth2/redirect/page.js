'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';

// 소셜 로그인 후 리디렉션되는 페이지
export default function OAuth2RedirectPage() {
    const router = useRouter();
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('OAuth2 리디렉션 페이지에 도달했습니다. 인증 초기화를 시작합니다.');

        // 인증 상태 초기화 (쿠키의 토큰으로 사용자 정보 가져오기)
        useAuthStore.getState().initializeAuth()
            .then(userData => {
                if (userData) {
                    console.log('인증 초기화 성공:', userData);
                    // 닉네임 정보가 없으면 신규 소셜 가입자로 판단
                    if (!userData.nickname) {
                        console.log('신규 소셜 가입자입니다. 추가 정보 입력 페이지로 이동합니다.');
                        router.push('/signup/social');
                    } else {
                        console.log('기존 회원입니다. 메인 페이지로 이동합니다.');
                        router.push('/');
                    }
                } else {
                    // userData가 null이면 인증 실패로 간주
                    throw new Error('인증에 실패했습니다. 로그인 정보를 확인해주세요.');
                }
            })
            .catch(err => {
                console.error('OAuth2 리디렉션 중 인증 초기화 실패:', err);
                const errorMessage = err.message || '인증에 실패했습니다. 로그인 페이지로 다시 시도해주세요.';
                setError(errorMessage);
            });
    }, [router]);

    // 에러가 발생한 경우
    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    p: 3,
                }}
            >
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography>{error}</Typography>
                </Alert>
                <Button variant="contained" onClick={() => router.push('/login')}>
                    로그인 페이지로 돌아가기
                </Button>
            </Box>
        );
    }

    // 처리 중인 경우 로딩 스피너 표시
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
                로그인 정보를 확인 중입니다. 잠시만 기다려주세요...
            </Typography>
        </Box>
    );
}