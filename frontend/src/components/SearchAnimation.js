import React from 'react';
import { Box, keyframes } from '@mui/material';
import StyledSearchBar from './StyledSearchBar';

// --- 모든 애니메이션 로직을 하나의 객체로 묶기 ---
const animationConfig = {
  duration: '10s',
  timing: 'infinite forwards',

  // 1. 키프레임 정의
  keyframes: {
    // 오른쪽 집게 컨테이너의 움직임
    grabberRight: keyframes`
      0% { transform: translate(-50%, 0px); opacity: 1; }
      10% { transform: translate(-150%, 0px); }      /* 10%까지 이동 */
      40% { transform: translate(-150%, 240px); }   /* 30%동안 내려옴 */
      50% { transform: translate(-150%, 240px); }   /* 10%동안 멈춤 */
      80% { transform: translate(-150%, 0px); }      /* 30%동안 올라감 */
      89.9% { opacity: 1; }
      90% { opacity: 0; }
      100% { transform: translate(-50%, 0px); opacity: 0; }
    `,
    // 왼쪽 집게 컨테이너의 움직임 (좌우 반전)
    grabberLeft: keyframes`
      0% { transform: translate(50%, 0px); opacity: 1; }
      10% { transform: translate(150%, 0px); }
      40% { transform: translate(150%, 240px); }
      50% { transform: translate(150%, 240px); }
      80% { transform: translate(150%, 0px); }
      89.9% { opacity: 1; }
      90% { opacity: 0; }
      100% { transform: translate(50%, 0px); opacity: 0; }
    `,
    // 아이템이 잡혔을 때 나타남 (공용)
    itemAppear: keyframes`
      0%, 39.9% { opacity: 0; } /* 40% 시점에 나타남 */
      40% { opacity: 1; }
      89.9% { opacity: 1; }
      90%, 100% { opacity: 0; }
    `,
    // 아이템이 잡혔을 때 사라짐 (공용)
    itemDisappear: keyframes`
      0%, 39.9% { opacity: 1; } /* 40% 시점에 사라짐 */
      40% { opacity: 0; }
      99.9% { opacity: 0; }
      100% { opacity: 1; }
    `,
  },

  // 2. 각 요소의 스타일 및 애니메이션 적용
  getStyles: (animate = true) => ({
    // --- 오른쪽 애니메이션 요소들 ---
    clawContainerRight: {
      position: 'absolute',
      top: '-190px',
      left: 'calc(50% + 500px)',
      transform: 'translateX(-50%)',
      zIndex: 2,
      width: '80px',
      height: '180px',
      animation: animate ? `${animationConfig.keyframes.grabberRight} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    floorResume: {
      position: 'absolute',
      bottom: '110px',
      left: 'calc(50% + 420px)',
      transform: 'translateX(-50%) rotate(0deg) translateY(170px)',
      width: '50px',
      height: '50px',
      objectFit: 'contain',
      zIndex: 0,
      animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    grabbedResume: {
      position: 'absolute',
      top: '50px',
      left: '15px',
      width: '50px',
      height: '50px',
      objectFit: 'contain',
      transform: 'rotate(5deg)',
      animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    // --- 왼쪽 애니메이션 요소들 ---
    clawContainerLeft: {
      opacity: 0, // 애니메이션 시작 전까지 숨기기
      position: 'absolute',
      top: '-240px',
      left: 'calc(50% - 650px)',
      transform: 'translateX(-50%)',
      zIndex: 2,
      width: '80px',
      height: '180px',
      animation: animate ? `${animationConfig.keyframes.grabberLeft} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
    floorCompany: {
      position: 'absolute',
      bottom: '110px',
      left: 'calc(50% - 490px)',
      transform: 'translateX(-50%) rotate(0deg) translateY(120px)',
      width: '50px',
      height: '50px',
      objectFit: 'contain',
      zIndex: 0,
      animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
    grabbedCompany: {
      opacity: 0, // 애니메이션 시작 전까지 숨기기
      position: 'absolute',
      top: '50px',
      left: '15px',
      width: '50px',
      height: '50px',
      objectFit: 'contain',
      transform: 'rotate(-5deg)',
      animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
  }),
};

const SearchAnimation = ({ onFilterClick, isFilterOpen }) => {
  const animate = true;
  const styles = animationConfig.getStyles(animate);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: 'auto', height: '80px' }}>
      
      {/* --- 왼쪽 애니메이션 --- */}
      {/* 바닥에 놓인 기업 아이콘 */}
      <Box
        component="img"
        src="/company.png"
        alt="Company before grab"
        sx={styles.floorCompany}
      />
      {/* 왼쪽 집게 컨테이너 */}
      <Box sx={styles.clawContainerLeft}>
        <Box component="img" src="/claw.png" alt="Claw Left" sx={{ position: 'absolute', top: '0px', left: '0px', width: '80px', height: '80px', objectFit: 'contain' }} />
        <Box component="img" src="/company.png" alt="Grabbed Company" sx={styles.grabbedCompany} />
      </Box>

      {/* --- 오른쪽 애니메이션 --- */}
      {/* 바닥에 놓인 이력서 */}
      <Box
        component="img"
        src="/resume.png"
        alt="Resume before grab"
        sx={styles.floorResume}
      />
      {/* 오른쪽 집게 컨테이너 */}
      <Box sx={styles.clawContainerRight}>
        <Box component="img" src="/claw.png" alt="Claw Right" sx={{ position: 'absolute', top: '0px', left: '0px', width: '80px', height: '80px', objectFit: 'contain' }} />
        <Box component="img" src="/resume.png" alt="Grabbed Resume" sx={styles.grabbedResume} />
      </Box>

      {/* 검색 바 */}
      <StyledSearchBar onFilterClick={onFilterClick} isFilterOpen={isFilterOpen} />
    </Box>
  );
};

export default SearchAnimation;