'use client';

import { Suspense, useState } from 'react';
import { Container, Typography, Card, CardContent, Button, Grid, Box } from '@mui/material';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import TossCheckoutWidget from '@/components/payment/TossCheckoutWidget'; // 생성할 컴포넌트

// 크레딧 구매 상품 목록
const packages = [
    { id: "PRODUCT_10K", name: "10,000 크레딧", price: 10000 },
    { id: "PRODUCT_100K", name: "100,000 크레딧", price: 70000, discount: true }
];

function CreditStore() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState(null); // 선택된 상품

    // 비로그인 사용자는 로그인 페이지로 리디렉션
    if (typeof window !== 'undefined' && !isAuthenticated) {
        router.replace('/login');
        return null; 
    }

    // 상품을 선택하면 결제 위젯을 보여줌
    if (selectedPackage) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {selectedPackage.name} 결제
                </Typography>
                {/* 결제 위젯 컴포넌트 */}
                <Suspense fallback={<div>결제 모듈을 불러오는 중...</div>}>
                    <TossCheckoutWidget 
                        packageId={selectedPackage.id}
                        onCancel={() => setSelectedPackage(null)} // 뒤로가기 버튼
                    />
                </Suspense>
            </Container>
        );
    }

    // 상품 선택 화면
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                크레딧 상점
            </Typography>
            <Grid container spacing={3}>
                {packages.map((pkg) => (
                    <Grid item xs={12} md={6} key={pkg.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{pkg.name}</Typography>
                                {pkg.discount && (
                                    <Typography color="error">
                                        <s>100,000원</s> 30% 할인!
                                    </Typography>
                                )}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {pkg.price.toLocaleString()}원
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={() => setSelectedPackage(pkg)}
                                >
                                    구매하기
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

// Suspense로 감싸서 클라이언트 사이드 훅(useRouter 등) 사용 문제를 방지
export default function StorePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreditStore />
        </Suspense>
    );
}
