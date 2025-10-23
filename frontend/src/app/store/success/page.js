'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
import { api as axios } from '@/api';

function SuccessPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("결제 승인 중입니다...");
    const [error, setError] = useState(null);

    useEffect(() => {
        const confirmPayment = async () => {
            const paymentKey = searchParams.get("paymentKey");
            const orderId = searchParams.get("orderId");
            const amount = searchParams.get("amount");

            if (!paymentKey || !orderId || !amount) {
                setError("잘못된 결제 요청입니다.");
                return;
            }

            try {
                // 1. 우리 백엔드에 결제 승인 요청
                const response = await axios.post('/api/payment/confirm', {
                    paymentKey,
                    orderId,
                    amount: Number(amount),
                });
                
                // 2. 백엔드 응답(Toss 원본 객체)에 따라 분기
                const { status, virtualAccount } = response.data;
                
                if (status === "DONE") {
                    setMessage("결제가 완료되었습니다! 크레딧이 충전되었습니다.");
                } else if (status === "WAITING_FOR_DEPOSIT") {
                    setMessage(
                        `가상계좌가 발급되었습니다. 입금 기한 내에 입금해주세요.\n` +
                        `은행: ${virtualAccount.bank}\n` +
                        `계좌번호: ${virtualAccount.accountNumber}\n` +
                        `입금 기한: ${new Date(virtualAccount.dueDate).toLocaleString()}`
                    );
                } else {
                    setError(`결제는 완료되었으나 처리 중 오류 발생: ${status}`);
                }

                // 5초 후 마이페이지로 이동
                setTimeout(() => router.replace('/mypage'), 5000);
                
            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || err.message;
                // 실패 페이지로 리다이렉트
                router.replace(`/store/fail?code=${err.response?.status || '500'}&message=${encodeURIComponent(errorMsg)}`);
            }
        };

        confirmPayment();
    }, [searchParams, router]);

    return (
        <Container sx={{ mt: 5, textAlign: 'center' }}>
            <Box>
                {error ? (
                    <Typography variant="h5" color="error">{error}</Typography>
                ) : (
                    <>
                        <CircularProgress sx={{ mb: 3 }} />
                        <Typography variant="h5" style={{ whiteSpace: 'pre-line' }}>
                            {message}
                        </Typography>
                    </>
                )}
            </Box>
        </Container>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<CircularProgress />}>
            <SuccessPageContent />
        </Suspense>
    );
}
