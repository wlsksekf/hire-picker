'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import AnimatedButton from './AnimatedButton';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buttonStyles = {
    fontSize: isMobile ? '0.7rem' : '0.8rem',
    padding: isMobile ? '4px 8px' : '6px 12px',
  };

  return (
    <AppBar
      position="sticky"
      elevation={0} // 그림자 제거
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/claw.png"
              alt="HirePicker Logo"
              sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                marginRight: '8px' 
              }}
            />
            <Typography variant="h6" component="span" fontWeight="bold">
              HirePicker
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={{ ...buttonStyles, ml: isMobile ? 1 : 2 }}>로그인</AnimatedButton>
          </Link>
          <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={buttonStyles}>회원가입</AnimatedButton>
          </Link>
          <Link href="/settings" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={buttonStyles}>설정</AnimatedButton>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
