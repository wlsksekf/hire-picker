import React from 'react';
import { Box, keyframes, useTheme, useMediaQuery } from '@mui/material';
import StyledSearchBar from './StyledSearchBar';
import ImageInBall from './ImageInBall'; // Import the new component

// --- Animation logic remains the same ---
const animationConfig = {
  duration: '10s',
  timing: 'infinite forwards',

  keyframes: {
    grabberRight: keyframes`
      0% { transform: translate(-50%, 0px); opacity: 1; }
      10% { transform: translate(-150%, 0px); }
      40% { transform: translate(-150%, 260px); }
      50% { transform: translate(-150%, 260px); }
      80% { transform: translate(-150%, 0px); }
      89.9% { opacity: 1; }
      90% { opacity: 0; }
      100% { transform: translate(-50%, 0px); opacity: 0; }
    `,
    grabberLeft: keyframes`
      0% { transform: translate(50%, 0px); opacity: 1; }
      10% { transform: translate(150%, 0px); }
      40% { transform: translate(150%, 260px); }
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

  getStyles: function(animate = true) {
    return {
      // --- 오른쪽 애니메이션 요소들 ---
      clawContainerRight: {
        position: 'absolute',
        top: '-180px',
        left: 'calc(50% + 450px)',
        transform: 'translateX(-50%)',
        zIndex: 2,
        width: '60px',
        height: '140px',
        animation: animate ? `${animationConfig.keyframes.grabberRight} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
      },
      floorResume: {
        position: 'absolute',
        bottom: '110px',
        left: 'calc(50% + 390px)',
        transform: 'translateX(-50%) rotate(0deg) translateY(180px)',
        width: '40px',
        height: '40px',
        zIndex: 0,
        animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
      },
      grabbedResume: {
        position: 'absolute',
        top: '40px',
        left: '10px',
        width: '40px',
        height: '40px',
        transform: 'rotate(5deg)',
        animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing}` : 'none',
      },
      // --- 왼쪽 애니메이션 요소들 ---
      clawContainerLeft: {
        opacity: 0,
        position: 'absolute',
        top: '-230px',
        left: 'calc(50% - 550px)',
        transform: 'translateX(-50%)',
        zIndex: 2,
        width: '60px',
        height: '140px',
        animation: animate ? `${animationConfig.keyframes.grabberLeft} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
      },
      floorCompany: {
        position: 'absolute',
        bottom: '110px',
        left: 'calc(50% - 428px)',
        transform: 'translateX(-50%) rotate(0deg) translateY(185px)',
        width: '40px',
        height: '40px',
        zIndex: 0,
        animation: animate ? `${animationConfig.keyframes.itemDisappear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
      },
      grabbedCompany: {
        opacity: 0,
        position: 'absolute',
        top: '40px',
        left: '10px',
        width: '40px',
        height: '40px',
        transform: 'rotate(-5deg)',
        animation: animate ? `${animationConfig.keyframes.itemAppear} ${animationConfig.duration} ${animationConfig.timing} 2s` : 'none',
      },
    }
  },
};

function SearchAnimation({ onFilterClick, isFilterOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animate = true;
  const styles = animationConfig.getStyles(animate);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: 'auto', height: isMobile ? 'auto' : '80px' }}>
      {!isMobile && (
        <>
          {/* Replace Box with ImageInBall */}
          <ImageInBall
            imgSrc="/company.png"
            alt="Company before grab"
            sx={styles.floorCompany}
          />
          <Box sx={styles.clawContainerLeft}>
            <Box component="img" src="/claw.png" alt="Claw Left" sx={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', objectFit: 'contain' }} />
            {/* Replace Box with ImageInBall */}
            <ImageInBall imgSrc="/company.png" alt="Grabbed Company" sx={styles.grabbedCompany} />
          </Box>
          {/* Replace Box with ImageInBall */}
          <ImageInBall
            imgSrc="/resume.png"
            alt="Resume before grab"
            sx={styles.floorResume}
          />
          <Box sx={styles.clawContainerRight}>
            <Box component="img" src="/claw.png" alt="Claw Right" sx={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', objectFit: 'contain' }} />
            {/* Replace Box with ImageInBall */}
            <ImageInBall imgSrc="/resume.png" alt="Grabbed Resume" sx={styles.grabbedResume} />
          </Box>
        </>
      )}
      <StyledSearchBar onFilterClick={onFilterClick} isFilterOpen={isFilterOpen} />
    </Box>
  );
}

export default SearchAnimation;