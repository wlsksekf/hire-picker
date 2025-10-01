import React from 'react';
import { Box, keyframes } from '@mui/material';
import StyledSearchBar from './StyledSearchBar';

// 집게(Claw)의 움직임을 정의하는 애니메이션
const grabberAnimation = keyframes`
  0% {
    transform: translate(-50%, 0px);
    opacity: 1;
  }
  10% {
    transform: translate(-150%, 0px);
  }
  20% {
    transform: translate(-150%, 240px); /* 아래로 내려와서 잡는 동작 */
  }
  25% {
    transform: translate(-150%, 240px); /* 잠시 멈춤 */
  }
  80% {
    transform: translate(-150%, 0px); /* 위로 다시 올라감 */
  }
  89.9% {
    opacity: 1; /* 사라지기 직전까지 보임 */
  }
  90% {
    opacity: 0; /* 사라짐 */
  }
  100% {
    transform: translate(-50%, 0px);
    opacity: 0;
  }
`;

// 집게에 잡힌 이력서의 '나타남/사라짐'을 정의하는 애니메이션
const grabbedResumeVisibility = keyframes`
  0%, 14.9% {
    opacity: 0; /* 시작 시, 잡기 전까지 보이지 않음 */
  }
  15% {
    opacity: 1; /* 잡는 시점에 나타남 */
  }
  89.9% {
    opacity: 1; /* 올라가는 동안 계속 보임 */
  }
  90%, 100% {
    opacity: 0; /* 집게와 '동시에' 사라짐 (수정된 부분) */
  }
`;

// 바닥에 있는 이력서가 '사라짐/나타남'을 정의하는 애니메이션
const itemDisappear = keyframes`
  0%, 14.9% {
    opacity: 1; /* 시작 시, 잡히기 전까지 보임 */
  }
  15% {
    opacity: 0; /* 잡히는 시점에 사라짐 */
  }
  99.9% {
    opacity: 0; /* 애니메이션이 끝날 때까지 보이지 않음 */
  }
  100% {
    opacity: 1; /* 다음 사이클을 위해 다시 나타남 (수정된 부분) */
  }
`;

const SearchAnimation = ({ onFilterClick, isFilterOpen }) => {
  const animate = true;

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: 'auto', height: '280px' }}>
      {/* 바닥에 놓인 아이템들 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0px',
          zIndex: 0,
          width: '200px',
          justifyContent: 'center',
        }}
      >
        {/* 잡히기 전 이력서 (바닥) */}
        <Box
          component="img"
          src="/resume.png"
          alt="Resume before grab"
          sx={{
            position: 'absolute',
            bottom: '110px',
            left: 'calc(50% + 415px)', // Aligned with claw's horizontal path, 5px right
            transform: 'translateX(-50%) rotate(0deg)',
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            zIndex: 0,
            animation: animate ? `${itemDisappear} 4s infinite forwards` : 'none',
          }}
        />
      </Box>

      {/* 집게 컨테이너 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-150px',
          left: 'calc(50% + 500px)',
          transform: 'translateX(-50%)',
          zIndex: 2,
          animation: animate ? `${grabberAnimation} 4s infinite forwards` : 'none',
          width: '80px',
          height: '180px',
        }}
      >
        {/* 집게 이미지 */}
        <Box
          component="img"
          src="/claw.png"
          alt="Claw"
          sx={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '80px',
            height: '80px',
            objectFit: 'contain',
          }}
        />
        {/* 잡힌 이력서 이미지 */}
        <Box
          component="img"
          src="/resume.png"
          alt="Grabbed Resume"
          sx={{
            position: 'absolute',
            top: '50px',
            left: '15px',
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            transform: 'rotate(5deg)',
            animation: animate ? `${grabbedResumeVisibility} 4s infinite forwards` : 'none',
          }}
        />
      </Box>

      {/* 검색 바 */}
      <StyledSearchBar onFilterClick={onFilterClick} isFilterOpen={isFilterOpen} />
    </Box>
  );
};

export default SearchAnimation;