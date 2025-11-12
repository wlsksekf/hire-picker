'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Box, CircularProgress, Typography, Alert, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

// 소셜 로그인 후 리디렉션되는 페이지
export default function OAuth2RedirectPage() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(null);
    const [pendingRedirect, setPendingRedirect] = useState(null);
    const [hasBonusParam, setHasBonusParam] = useState(false);

    useEffect(() => {
        console.log('OAuth2 리디렉션 페이지에 도달했습니다. 인증 초기화를 시작합니다.');

        if (typeof window === 'undefined') {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        if (params.has('signupBonus')) {
            const bonus = Number(params.get('signupBonus'));
            setBonusAmount(Number.isNaN(bonus) ? null : bonus);
            setBonusDialogOpen(true);
            setHasBonusParam(true);
        }
    }, []);

    useEffect(() => {
        console.log('OAuth2 리디렉션 페이지에 도달했습니다. 인증 초기화를 시작합니다.');

        useAuthStore.getState().initializeAuth()
            .then(userData => {
                if (userData) {
                    console.log('인증 초기화 성공:', userData);
                    const destination = userData.nickname ? '/' : '/signup/social';

                    if (hasBonusParam) {
                        setPendingRedirect(destination);
                    } else {
                        router.push(destination);
                    }
                } else {
                    throw new Error('인증에 실패했습니다. 로그인 정보를 확인해주세요.');
                }
            })
            .catch(err => {
                console.error('OAuth2 리디렉션 중 인증 초기화 실패:', err);
                const errorMessage = err.message || '인증에 실패했습니다. 로그인 페이지로 다시 시도해주세요.';
                setError(errorMessage);
            });
    }, [router, hasBonusParam]);

    const handleBonusDialogClose = () => {
        setBonusDialogOpen(false);
        if (pendingRedirect) {
            router.push(pendingRedirect);
        } else {
            router.push('/');
        }
    };

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

            <Dialog open={bonusDialogOpen} onClose={handleBonusDialogClose}>
                <DialogTitle>환영합니다!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        신규 가입 보너스로 {(bonusAmount ?? 5000).toLocaleString()} 크레딧이 지급되었습니다.
                        추가 정보 입력 또는 메인 페이지에서 크레딧을 확인해 주세요.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBonusDialogClose} autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}