"use client";

import React, { useState, useEffect } from 'react';
// import { CardMedia } from '@mui/material'; // CardMedia 임포트 제거

// Base64로 인코딩된 1x1 흰색 투명 GIF 이미지
const whitePixel =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function FallbackImage({ src, alt, sx, ...props }) { // sx prop 추가
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // src prop이 변경될 때 currentSrc를 업데이트하고 에러 상태를 초기화
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) { // 무한 루프 방지
      setCurrentSrc(whitePixel);
      setHasError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      style={{ ...sx }} // sx prop을 style로 변환하여 적용
      {...props}
    />
  );
}
