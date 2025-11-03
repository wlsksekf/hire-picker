import React from 'react';
import { Box } from '@mui/material';
import StyledSearchBar from './StyledSearchBar';
import {
  animationDuration,
  grabberAnimation,
  grabbedItemVisibility,
  itemDisappear,
} from '../theme/animations';

// Font Awesome 아이콘 임포트
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// (수정) Pro Duotone 대신 Free Solid 아이콘 임포트
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';
// (삭제) import { byPrefixAndName } from '@fortawesome/fontawesome-svg-core/import.macro';

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
          zIndex: 0,
          width: '200px',
          justifyContent: 'center',
        }}
      >
        {/* 아이템 1 (회사) */}
        <Box
          component="img"
          src="/company.png"
          alt="Company"
          sx={{
            position: 'absolute',
            bottom: '0px',
            left: '20px',
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            transform: 'rotate(-10deg)',
            animation: animate ? `${itemDisappear} ${animationDuration} infinite forwards` : 'none',
          }}
        />
        {/* 잡히기 전 돈주머니 (바닥) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '110px',
            left: 'calc(50% + 410px)',
            transform: 'translateX(-50%)',
            zIndex: 0,
            animation: animate ? `${itemDisappear} ${animationDuration} infinite forwards` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px',
          }}
        >
          {/* (수정) icon={faSackDollar} 사용, Duotone style 제거 */}
          <FontAwesomeIcon
            icon={faSackDollar}
            size="2x"
            color="#E6C700" // (수정) 돈주머니 색상 (금색 계열)
          />
        </Box>
        {/* 아이템 3 (회사) */}
        <Box
          component="img"
          src="/company.png"
          alt="Company"
          sx={{
            position: 'absolute',
            bottom: '0px',
            left: '100px',
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            transform: 'rotate(-5deg)',
            animation: animate ? `${itemDisappear} ${animationDuration} infinite forwards` : 'none',
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
          animation: animate ? `${grabberAnimation} ${animationDuration} infinite forwards` : 'none',
          width: '50px',
          height: '180px',
        }}
      >
        {/* 집게 이미지 */}
        <Box
          component="img"
          src="/hirepicker_logo.png"
          alt="Claw"
          sx={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '50px',
            height: '50px',
            objectFit: 'contain',
          }}
        />
        {/* 잡힌 돈주머니 이미지 */}
        <Box
          sx={{
            position: 'absolute',
            top: '35px',
            left: '0px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(5deg)',
            animation: animate ? `${grabbedItemVisibility} ${animationDuration} infinite forwards` : 'none',
          }}
        >
          {/* (수정) icon={faSackDollar} 사용, Duotone style 제거 */}
          <FontAwesomeIcon
            icon={faSackDollar}
            size="2x"
            color="#E6C700" // (수정) 돈주머니 색상 (금색 계열)
          />
        </Box>
      </Box>

      {/* 검색 바 */}
      <StyledSearchBar onFilterClick={onFilterClick} isFilterOpen={isFilterOpen} />
    </Box>
  );
};

export default SearchAnimation;