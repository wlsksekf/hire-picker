'use client';

import React from 'react';
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
    ListAlt,
    AutoAwesome // AutoAwesome 아이콘 추가
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240; // 사이드바 너비

// 사용자 타입에 따라 메뉴 항목을 정의합니다.
// 실제 애플리케이션에서는 로그인 정보에서 사용자 타입을 가져옵니다.
const userType = 'personal'; // 'personal' 또는 'company'로 변경하여 테스트

// 개인 회원 메뉴 항목
const personalMenuItems = [
  { text: '내 정보 수정', icon: <AccountCircle />, path: '/mypage/personal/edit-profile' },
  { text: '이력서 관리', icon: <Article />, path: '/mypage/personal/resumes' },
  // highlight-start
  { text: 'AI 이력서 작성', icon: <AutoAwesome />, path: '/mypage/personal/ai-resume' }, // 새 탭 추가
  // highlight-end
  { text: '지원 현황', icon: <WorkHistory />, path: '/mypage/personal/applications' },
  { text: '크레딧/결제 내역', icon: <Payment />, path: '/mypage/personal/credits' },
];

// 기업 회원 메뉴 항목
const companyMenuItems = [
    { text: '기업 정보 수정', icon: <Business />, path: '/mypage/company/edit-info' },
    { text: '채용공고 관리', icon: <ListAlt />, path: '/mypage/company/postings' },
    { text: '지원자 목록', icon: <AssignmentInd />, path: '/mypage/company/applicants' },
];

// 마이페이지 레이아웃 컴포넌트
function MyPageLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 모바일 화면 여부 확인
  const pathname = usePathname(); // 현재 경로

  const menuItems = userType === 'personal' ? personalMenuItems : companyMenuItems; // 사용자 타입에 따른 메뉴 선택

  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            마이페이지
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map(function(item, index) {
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} href={item.path} selected={pathname === item.path}> {/* 현재 경로와 일치하면 선택된 스타일 적용 */}
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent" // 항상 열려있는 Drawer
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
}

export default MyPageLayout;