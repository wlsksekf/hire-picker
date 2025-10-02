import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const FilterSection = ({ title, options, selectedOptions, onFilterChange, color }) => {
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
                borderColor: color,
                ...(isSelected
                  ? {
                      backgroundColor: color,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: color,
                      },
                    }
                  : {
                      color: color,
                      backgroundColor: 'transparent',
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
