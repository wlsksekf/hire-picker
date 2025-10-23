'use client';

import { useEffect, useState, useRef } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { api as axios } from '@/api'; // 설정된 axios 인스턴스 사용

export default function TossCheckoutWidget({ packageId, onCancel }) {
    const [paymentInfo, setPaymentInfo] = useState(null); // 서버로부터 받은 결제 정보
    const [tossWidgets, setTossWidgets] = useState(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    // 1. 컴포넌트 마운트 시, 서버에 결제 정보 생성 요청
    useEffect(() => {
        const initiate = async () => {
            try {
                const response = await axios.post('/api/payment/initiate', { packageId });
                setPaymentInfo(response.data);
            } catch (err) {
                console.error("Failed to initiate payment", err);
                setError("결제 정보를 불러오는 데 실패했습니다.");
            }
        };
        initiate();
    }, [packageId]);

    // 2. 서버에서 결제 정보(clientKey 등)를 받아오면, 토스 위젯 초기화
    useEffect(() => {
        if (!paymentInfo) return;

        const initTossWidgets = async () => {
            try {
                const tossPayments = await loadTossPayments(paymentInfo.clientKey);
                const widgets = tossPayments.widgets({
                    customerKey: paymentInfo.customerKey,
                });
                setTossWidgets(widgets);
            } catch (err) {
                console.error("Failed to load Toss SDK", err);
                setError("결제 모듈 로딩에 실패했습니다.");
            }
        };
        initTossWidgets();
    }, [paymentInfo]);

    // 3. 토스 위젯이 준비되면, 화면에 렌더링
    useEffect(() => {
        if (!tossWidgets || !paymentInfo) return;

        const renderWidgets = async () => {
            try {
                await tossWidgets.setAmount({
                    currency: "KRW",
                    value: paymentInfo.amount,
                });

                await Promise.all([
                    tossWidgets.renderPaymentMethods({
                        selector: "#payment-method",
                        variantKey: "DEFAULT",
                    }),
                    tossWidgets.renderAgreement({
                        selector: "#agreement",
                        variantKey: "AGREEMENT",
                    }),
                ]);
                setReady(true);
            } catch (err) {
                console.error("Failed to render widgets", err);
                setError("결제 UI 렌더링에 실패했습니다.");
            }
        };
        renderWidgets();
    }, [tossWidgets, paymentInfo]);

    // 4. "결제하기" 버튼 클릭 시
    const handlePaymentRequest = async () => {
        if (!tossWidgets || !paymentInfo || !ready) return;

        try {
            // 결제 요청
            await tossWidgets.requestPayment({
                orderId: paymentInfo.orderId,
                orderName: paymentInfo.orderName,
                successUrl: `${window.location.origin}/store/success`,
                failUrl: `${window.location.origin}/store/fail`,
            });
        } catch (error) {
            console.error(error);
            setError("결제 요청에 실패했습니다.");
        }
    };

    if (error) return <Typography color="error">{error}</Typography>;
    if (!paymentInfo) return <CircularProgress />;

    return (
        <Box>
            {/* 결제 UI 렌더링 영역 */}
            <Box id="payment-method" sx={{ minHeight: '300px' }} />
            {/* 이용약관 UI 렌더링 영역 */}
            <Box id="agreement" />

            <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                onClick={handlePaymentRequest}
                disabled={!ready}
            >
                {paymentInfo.amount.toLocaleString()}원 결제하기
            </Button>
            <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{ mt: 1 }}
                onClick={onCancel}
            >
                취소
            </Button>
        </Box>
    );
}
