import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';

const FilterSection = ({ title, options, selectedOptions, onFilterChange, color }) => {
  const theme = useTheme();

  const unselectedBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200];
  const unselectedBorderColor = theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400];
  const selectedTextColor = theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary;
  const selectedBorderColor = theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map(option => {
          const isSelected = selectedOptions.includes(option);
          return (
            <Chip
              key={option}
              label={option}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => onFilterChange(option)}
              sx={{
                fontWeight: 'bold',
                borderColor: isSelected ? selectedBorderColor : unselectedBorderColor,
                color: 'black',
                ...(isSelected
                  ? {
                      backgroundColor: color, // 선택 시 필터 색상
                      '&:hover': {
                        backgroundColor: color,
                      },
                    }
                  : {
                      backgroundColor: unselectedBgColor, // 미선택 시 회색 배경
                      '&:hover': {
                        backgroundColor: unselectedBgColor, // 호버 시에도 회색 유지
                      },
                    }),
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default FilterSection;
