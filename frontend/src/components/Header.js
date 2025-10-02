'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import Link from 'next/link';
import AnimatedButton from './AnimatedButton';
import DarkModeSwitch from './DarkModeSwitch';

const Header = ({ mode, setMode }) => {
  return (
    <AppBar
      position="sticky"
      color="default"
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <img src="/claw.png" alt="HirePicker Logo" width="40" height="40" style={{ marginRight: '8px' }} />
            <Typography variant="h6" component="span" fontWeight="bold">
              HirePicker
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DarkModeSwitch mode={mode} setMode={setMode} />
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={{ fontSize: '12px', padding: '6px 12px', ml: 2 }}>로그인</AnimatedButton>
          </Link>
          <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={{ fontSize: '12px', padding: '6px 12px', mr: 1 }}>회원가입</AnimatedButton>
          </Link>
          <Link href="/settings" passHref style={{ textDecoration: 'none' }}>
            <AnimatedButton color="primary" sx={{ fontSize: '12px', padding: '6px 12px' }}>설정</AnimatedButton>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;