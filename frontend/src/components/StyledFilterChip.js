import React from 'react';
import { Chip } from '@mui/material';

const StyledFilterChip = ({ label, chipColor, variant = 'filled', ...props }) => {
  return (
    <Chip
      label={label}
      variant={variant}
      sx={{
        fontWeight: 'bold',
        backgroundColor: chipColor,
        color: 'white',
        '&:hover': {
          backgroundColor: chipColor,
        },
        ...props.sx // Allow external sx prop to override or extend
      }}
      {...props}
    />
  );
};

export default StyledFilterChip;