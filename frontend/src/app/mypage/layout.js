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
  Typography,
  CircularProgress
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
import useAuthStore from '@/store/authStore'; // 인증 스토어 추가

const drawerWidth = 240; // 사이드바 너비

/**
 * 개인회원용 마이페이지 메뉴 항목
 *
 * 구성:
 * - 내 정보 수정: 프로필, 닉네임, 비밀번호 변경
 * - 이력서 관리: 이력서 CRUD
 * - AI 이력서 작성: AI를 활용한 자기소개서 작성 (크레딧 사용)
 * - 지원 현황: 내가 지원한 공고 목록
 * - 크레딧/결제 내역: 크레딧 충전 및 사용 내역
 */
const personalMenuItems = [
  { text: '내 정보 수정', icon: <AccountCircle />, path: '/mypage/personal/edit-profile' },
  { text: '이력서 관리', icon: <Article />, path: '/mypage/personal/resumes' },
  { text: 'AI 이력서 작성', icon: <AutoAwesome />, path: '/mypage/personal/ai-resume' },
  { text: '지원 현황', icon: <WorkHistory />, path: '/mypage/personal/applications' },
  { text: '크레딧/결제 내역', icon: <Payment />, path: '/mypage/personal/credits' },
];

/**
 * 기업회원용 마이페이지 메뉴 항목
 *
 * 구성:
 * - 기업 정보 수정: 회사 정보, 담당자 정보 변경
 * - 채용공고 관리: 채용공고 등록/수정/삭제
 * - 지원자 목록: 우리 회사 공고에 지원한 지원자 관리
 */
const companyMenuItems = [
    { text: '기업 정보 수정', icon: <Business />, path: '/mypage/company/edit-info' },
    { text: '채용공고 관리', icon: <ListAlt />, path: '/mypage/company/postings' },
    { text: '지원자 목록', icon: <AssignmentInd />, path: '/mypage/company/applicants' },
];

/**
 * 마이페이지 레이아웃 컴포넌트
 *
 * 역할:
 * - 마이페이지의 모든 하위 페이지에 공통으로 적용되는 레이아웃
 * - 좌측 사이드바에 메뉴를 표시하고, 우측에 콘텐츠 영역 제공
 *
 * 핵심 기능:
 * - 사용자 타입(개인/기업)에 따라 다른 메뉴 표시
 * - 현재 경로에 해당하는 메뉴 아이템 하이라이트
 *
 * 동작 흐름:
 * 1. authStore에서 현재 로그인한 사용자 정보 가져오기
 * 2. user.userType 확인 (PERSONAL 또는 COMPANY)
 * 3. 타입에 맞는 메뉴 선택
 * 4. 사이드바와 콘텐츠 영역 렌더링
 */
function MyPageLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 모바일 화면 여부 확인
  const pathname = usePathname(); // 현재 경로 (선택된 메뉴 표시용)
  const { user, isLoading } = useAuthStore(); // 인증 스토어에서 사용자 정보 가져오기

  // ===== STEP 1: 로딩 중 처리 =====
  // initializeAuth()가 실행 중일 때 로딩 스피너 표시
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ===== STEP 2: 사용자 타입에 따라 메뉴 선택 =====
  // 백엔드에서 userType이 'PERSONAL' 또는 'COMPANY'로 전달됨
  // 소문자로 변환하여 비교 ('personal' 또는 'company')
  const userType = user?.userType?.toLowerCase() || 'personal';

  // 타입에 따라 적절한 메뉴 배열 선택
  // - 개인회원: personalMenuItems (이력서, AI 작성, 지원 현황 등)
  // - 기업회원: companyMenuItems (채용공고, 지원자 목록 등)
  const menuItems = userType === 'personal' ? personalMenuItems : companyMenuItems;

  // ===== STEP 3: 사이드바 콘텐츠 구성 =====
  const drawerContent = (
    <div>
      {/* 사이드바 헤더 */}
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            마이페이지
        </Typography>
      </Toolbar>

      {/* 메뉴 리스트 */}
      <List>
        {menuItems.map(function(item, index) {
          return (
            <ListItem key={item.text} disablePadding>
              {/*
                selected: 현재 경로와 메뉴 경로가 일치하면 하이라이트
                예: /mypage/personal/edit-profile 페이지에서는 "내 정보 수정" 메뉴가 선택됨
              */}
              <ListItemButton
                component={Link}
                href={item.path}
                selected={pathname === item.path}
              >
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

  // ===== STEP 4: 레이아웃 렌더링 =====
  return (
    <Box sx={{ display: 'flex' }}>
      {/* 좌측 사이드바 (고정) */}
      <Drawer
        variant="permanent" // 항상 열려있는 Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 우측 콘텐츠 영역 */}
      {/* children: 실제 페이지 콘텐츠 (edit-profile, resumes 등) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MyPageLayout;
