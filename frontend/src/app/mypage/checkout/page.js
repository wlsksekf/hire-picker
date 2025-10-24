'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// CheckoutClient 컴포넌트를 동적으로 임포트하고 SSR을 비활성화합니다.
const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => <p>결제 페이지를 불러오는 중...</p>, // 로딩 중 표시될 내용
});

const CheckoutPage = () => {
  return (
    <Suspense fallback={<p>결제 페이지를 불러오는 중...</p>}> {/* useSearchParams를 위한 Suspense */}
      <DynamicCheckoutClient />
    </Suspense>
  );
};

export default CheckoutPage;