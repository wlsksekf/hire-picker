import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { lighten, darken } from '@mui/material/styles';

const FilterSection = ({ title, options, selectedOptions, onFilterChange, color }) => {
  const theme = useTheme();

  const unselectedBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200];
  const unselectedBorderColor = theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400];

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
                color: 'black',
                ...(isSelected
                  ? {
                      // MUI 색상 유틸리티를 사용하여 안전하게 색상 조절
                      backgroundColor: lighten(color, 0.25),
                      border: `1.5px solid ${darken(color, 0.15)}`,
                      '&:hover': {
                        backgroundColor: lighten(color, 0.25),
                      },
                    }
                  : {
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
};

export default FilterSection;
