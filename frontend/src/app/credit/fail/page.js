// frontend/src/app/credit/fail/page.js
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Button } from '@mui/material';
import Link from 'next/link';

function FailPageContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const message = searchParams.get("message");

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                    결제 실패
                </Typography>
                <Typography variant="body1">
                    <b>에러 코드:</b> {code || 'UNKNOWN_ERROR'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
                    <b>실패 사유:</b> {decodeURIComponent(message || '알 수 없는 오류가 발생했습니다.')}
                </Typography>
                <Button 
                    component={Link} 
                    href="/credit" 
                    variant="contained" 
                    fullWidth
                >
                    크레딧 상점으로 돌아가기
                </Button>
            </Paper>
        </Container>
    );
}

export default function FailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailPageContent />
        </Suspense>
    );
}
