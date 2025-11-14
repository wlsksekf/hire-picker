'use client';

import React from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faBell,
  faCookieBite,
} from '@fortawesome/free-solid-svg-icons';
import DarkModeSwitch from '../../components/DarkModeSwitch'; // 커스텀 스위치 import

// 설정 페이지 컴포넌트
function SettingsPage() {

  // 아이콘 스타일
  const iconStyle = {
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    color: 'text.secondary',
  };

  // 서브헤더 스타일
  const subheaderStyle = {
    fontWeight: 'bold',
    color: function (theme) {
      return theme.palette.text.secondary;
    },
    backgroundColor: 'transparent',
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        설정
      </Typography>
      <Paper
        sx={{
          mt: 2,
          backgroundColor: function (theme) {
            return theme.palette.background.paper;
          },
        }}
      >
        <List>
          {/* 앱 설정 그룹 */}
          <ListSubheader sx={subheaderStyle}>앱 설정</ListSubheader>
          <ListItem>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faPalette} size="lg" />
            </ListItemIcon>
            <ListItemText primary="테마 설정" secondary="라이트/다크 모드를 전환합니다." />
            <DarkModeSwitch isMobile={true} />
          </ListItem>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faBell} size="lg" />
            </ListItemIcon>
            <ListItemText primary="알림 설정" secondary="앱의 푸시 알림을 설정합니다." />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* 정보 그룹 */}
          <ListSubheader sx={subheaderStyle}>정보</ListSubheader>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faCookieBite} size="lg" />
            </ListItemIcon>
            <ListItemText
              primary="쿠키 및 개인정보"
              secondary="서비스의 쿠키 및 개인정보 처리 방침을 확인합니다."
            />
          </ListItemButton>
        </List>
      </Paper>
    </Container>
  );
}

export default SettingsPage;
