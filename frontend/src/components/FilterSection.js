import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { lighten, darken } from '@mui/material/styles';

// 필터링 옵션을 표시하고 선택할 수 있는 섹션 컴포넌트
function FilterSection({ title, options, selectedOptions, onFilterChange, color }) {
  const theme = useTheme();

  const unselectedBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200];
  const unselectedBorderColor = theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400];

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map(function(option) {
          const isSelected = selectedOptions.includes(option);

          return (
            <Chip
              key={option}
              label={option}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={function() { onFilterChange(option) }} // 칩 클릭 시 필터 변경
              sx={{
                fontWeight: 'bold',
                color: 'black',
                ...(isSelected
                  ? { // 선택된 경우 스타일
                      backgroundColor: lighten(color, 0.25),
                      border: `1.5px solid ${darken(color, 0.15)}`,
                      '&:hover': {
                        backgroundColor: lighten(color, 0.25),
                      },
                    }
                  : { // 선택되지 않은 경우 스타일
                      backgroundColor: unselectedBgColor,
                      borderColor: unselectedBorderColor,
                      '&:hover': {
                        backgroundColor: unselectedBgColor,
                      },
                    }),
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default FilterSection;