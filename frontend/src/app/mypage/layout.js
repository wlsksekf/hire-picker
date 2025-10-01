
'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import { 
    AccountCircle, 
    Article, 
    WorkHistory, 
    Payment, 
    Business, 
    AssignmentInd, 
    ListAlt 
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

// 사용자 타입에 따라 메뉴 항목을 정의합니다.
// 실제 애플리케이션에서는 로그인 정보에서 사용자 타입을 가져옵니다.
const userType = 'personal'; // 'personal' 또는 'company'로 변경하여 테스트

const personalMenuItems = [
  { text: '내 정보 수정', icon: <AccountCircle />, path: '/mypage/personal/edit-profile' },
  { text: '이력서 관리', icon: <Article />, path: '/mypage/personal/resumes' },
  { text: '지원 현황', icon: <WorkHistory />, path: '/mypage/personal/applications' },
  { text: '크레딧/결제 내역', icon: <Payment />, path: '/mypage/personal/credits' },
];

const companyMenuItems = [
    { text: '기업 정보 수정', icon: <Business />, path: '/mypage/company/edit-info' },
    { text: '채용공고 관리', icon: <ListAlt />, path: '/mypage/company/postings' },
    { text: '지원자 목록', icon: <AssignmentInd />, path: '/mypage/company/applicants' },
];

const MyPageLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  const menuItems = userType === 'personal' ? personalMenuItems : companyMenuItems;

  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            마이페이지
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.path} selected={pathname === item.path}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', position: 'relative', borderRight: '1px solid #e0e0e0' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MyPageLayout;
