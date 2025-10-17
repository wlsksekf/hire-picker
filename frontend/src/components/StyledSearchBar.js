'use client';

import React from 'react';
import {
  TextField,
  IconButton,
  Box
} from '@mui/material';
import { FilterList as FilterListIcon, Search as SearchIcon } from '@mui/icons-material';
import AnimatedButton from '@/components/AnimatedButton';

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
              onClick={onFilterClick}
              sx={{
                borderRadius: '50%', // 아이콘 버튼을 둥글게
                color: isFilterOpen ? 'primary.main' : 'inherit',
                marginRight: '8px' // 아이콘과 검색 버튼 사이 간격 조정
              }}
            >
              <FilterListIcon />
            </IconButton>
          ),
        }}
      />
      {/* 검색 버튼을 AnimatedButton으로 교체 */}
      <AnimatedButton 
        color="primary" 
        sx={{ 
            minWidth: '56px', // 너비 고정
            width: '56px', 
            height: '56px', 
            padding: 0, 
            borderRadius: '50px' // 다른 버튼과 통일
        }}
      >
        <SearchIcon />
      </AnimatedButton>
    </Box>
  );
}

export default StyledSearchBar;