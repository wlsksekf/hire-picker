import React from 'react';
import { Box, keyframes, useTheme, useMediaQuery } from '@mui/material';
import StyledSearchBar from './StyledSearchBar';

// --- 모든 애니메이션 로직을 하나의 객체로 묶기 ---
const animationConfig = {
  duration: '10s',
  timing: 'infinite forwards',

  // 1. 키프레임 정의
  keyframes: {
    grabberRight: keyframes`
      0% { transform: translate(-50%, 0px); opacity: 1; }
      10% { transform: translate(-150%, 0px); }
      40% { transform: translate(-150%, 260px); } // 이동 거리 조정
      50% { transform: translate(-150%, 260px); }
      80% { transform: translate(-150%, 0px); }
      89.9% { opacity: 1; }
      90% { opacity: 0; }
      100% { transform: translate(-50%, 0px); opacity: 0; }
    `,
    grabberLeft: keyframes`
      0% { transform: translate(50%, 0px); opacity: 1; }
      10% { transform: translate(150%, 0px); }
      40% { transform: translate(150%, 260px); } // 이동 거리 조정
      50% { transform: translate(150%, 260px); }
      80% { transform: translate(150%, 0px); }
      89.9% { opacity: 1; }
      90% { opacity: 0; }
      100% { transform: translate(50%, 0px); opacity: 0; }
    `,
    itemAppear: keyframes`
      0%, 39.9% { opacity: 0; }
      40% { opacity: 1; }
      89.9% { opacity: 1; }
      90%, 100% { opacity: 0; }
    `,
    itemDisappear: keyframes`
      0%, 39.9% { opacity: 1; }
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
      top: '-180px',
      left: 'calc(50% + 450px)', // 위치 조정
      transform: 'translateX(-50%)',
      zIndex: 2,
      width: '60px', // 크기 축소
      height: '140px', // 크기 축소
      animation: animate ? `${animationConfig.keyframes.grabberRight} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    floorResume: {
      position: 'absolute',
      bottom: '110px',
      left: 'calc(50% + 390px)', // 위치 조정
      transform: 'translateX(-50%) rotate(0deg) translateY(180px)', // 10px 아래로 이동
      width: '40px', // 크기 축소
      height: '40px', // 크기 축소
      objectFit: 'contain',
      zIndex: 0,
      animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    grabbedResume: {
      position: 'absolute',
      top: '40px', // 위치 조정
      left: '10px', // 위치 조정
      width: '40px', // 크기 축소
      height: '40px', // 크기 축소
      objectFit: 'contain',
      transform: 'rotate(5deg)',
      animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
    },
    // --- 왼쪽 애니메이션 요소들 ---
    clawContainerLeft: {
      opacity: 0,
      position: 'absolute',
      top: '-230px', // 위치 조정
      left: 'calc(50% - 550px)', // 위치 조정
      transform: 'translateX(-50%)',
      zIndex: 2,
      width: '60px', // 크기 축소
      height: '140px', // 크기 축소
      animation: animate ? `${animationConfig.keyframes.grabberLeft} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
    floorCompany: {
      position: 'absolute',
      bottom: '110px',
      left: 'calc(50% - 428px)', // 8px 왼쪽으로 더 이동
      transform: 'translateX(-50%) rotate(0deg) translateY(135px)', // 15px 아래로
      width: '40px', // 크기 축소
      height: '40px', // 크기 축소
      objectFit: 'contain',
      zIndex: 0,
      animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
    grabbedCompany: {
      opacity: 0,
      position: 'absolute',
      top: '40px', // 위치 조정
      left: '10px', // 위치 조정
      width: '40px', // 크기 축소
      height: '40px', // 크기 축소
      objectFit: 'contain',
      transform: 'rotate(-5deg)',
      animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
    },
  }),
};

const SearchAnimation = ({ onFilterClick, isFilterOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animate = true;
  const styles = animationConfig.getStyles(animate);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: 'auto', height: isMobile ? 'auto' : '80px' }}>
      {!isMobile && (
        <>
          <Box
            component="img"
            src="/company.png"
            alt="Company before grab"
            sx={styles.floorCompany}
          />
          <Box sx={styles.clawContainerLeft}>
            <Box component="img" src="/claw.png" alt="Claw Left" sx={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', objectFit: 'contain' }} />
            <Box component="img" src="/company.png" alt="Grabbed Company" sx={styles.grabbedCompany} />
          </Box>
          <Box
            component="img"
            src="/resume.png"
            alt="Resume before grab"
            sx={styles.floorResume}
          />
          <Box sx={styles.clawContainerRight}>
            <Box component="img" src="/claw.png" alt="Claw Right" sx={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', objectFit: 'contain' }} />
            <Box component="img" src="/resume.png" alt="Grabbed Resume" sx={styles.grabbedResume} />
          </Box>
        </>
      )}
      <StyledSearchBar onFilterClick={onFilterClick} isFilterOpen={isFilterOpen} />
    </Box>
  );
};

export default SearchAnimation;