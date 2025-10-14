'use client';

import React from 'react';
import { Box } from '@mui/material';

const ImageInBall = ({ imgSrc, alt, sx }) => {
  return (
    <Box sx={{
      ...sx, // Apply animation styles passed from parent
      position: 'relative', // Needed for pseudo-elements
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      // Create a glassy/3D effect with multiple gradients and shadows
      background: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.3), rgba(255,255,255,0.1) 70%)', // Bottom highlight
      backdropFilter: 'blur(4px)',
      border: '1.5px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 -4px 15px rgba(255,255,255,0.4), 0 5px 15px rgba(0,0,0,0.2)', // Inner bottom highlight and outer drop shadow
      '&::before': { // Top-left glossy highlight
        content: '""',
        position: 'absolute',
        top: '5%',
        left: '10%',
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.7), transparent 40%)',
        filter: 'blur(2px)',
      },
    }}>
      <Box
        component="img"
        src={imgSrc}
        alt={alt}
        sx={{
          width: '60%',
          height: '60%',
          objectFit: 'contain',
          // Add a slight shadow to the image itself to give it depth
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
        }}
      />
    </Box>
  );
};

export default ImageInBall;