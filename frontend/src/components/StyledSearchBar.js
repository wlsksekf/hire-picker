'use client';

import React from 'react';
import {
  TextField,
  IconButton,
  Box
} from '@mui/material';
import { FilterList as FilterListIcon, Search as SearchIcon } from '@mui/icons-material';
import AnimatedButton from '@/components/AnimatedButton';

// 스타일이 적용된 검색 바 컴포넌트
function StyledSearchBar({ onFilterClick, isFilterOpen }) {
  return (
    <Box sx={{ maxWidth: '700px', margin: 'auto', display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="검색어를 입력하세요..."
        sx={{
          flexGrow: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '50px',
            backgroundColor: 'white',
            paddingRight: '0px' // 아이콘을 위한 패딩 조정
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={onFilterClick} // 필터 아이콘 클릭 시
              sx={{
                borderRadius: '50%', // 아이콘 버튼을 둥글게
                color: isFilterOpen ? 'primary.main' : 'inherit', // 필터가 열려있으면 색상 변경
                marginRight: '8px' // 아이콘과 검색 버튼 사이 간격 조정
              }}
            >
              <FilterListIcon />
            </IconButton>
          ),
        }}
      />
      {/* 검색 버튼 */}
      <AnimatedButton 
        color="primary" 
        sx={{ 
            minWidth: '56px', 
            width: '56px', 
            height: '56px', 
            padding: 0, 
            borderRadius: '50px'
        }}
      >
        <SearchIcon />
      </AnimatedButton>
    </Box>
  );
}

export default StyledSearchBar;
