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
  faFileLines,
  faKey,
  faPalette,
  faGear,
  faCreditCard,
  faCookieBite
} from '@fortawesome/free-solid-svg-icons';
import DarkModeSwitch from '../../components/DarkModeSwitch'; // 커스텀 스위치 import

const SettingsPage = () => {

  const iconStyle = {
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    color: 'text.secondary' // 3. 아이콘 색상 적용
  };

  const subheaderStyle = {
    fontWeight: 'bold',
    color: (theme) => theme.palette.text.secondary,
    backgroundColor: 'transparent' // Ensure it doesn't have its own background
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        설정
      </Typography>
      <Paper sx={{ 
        mt: 2,
        backgroundColor: (theme) => theme.palette.background.paper // 1. Paper 배경색 적용
      }}>
        <List>
          {/* 계정 그룹 */}
          <ListSubheader sx={subheaderStyle}>계정</ListSubheader>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faFileLines} size="lg" />
            </ListItemIcon>
            <ListItemText primary="이력서 관리" secondary="내 이력서를 관리합니다." />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faKey} size="lg" />
            </ListItemIcon>
            <ListItemText primary="비밀번호 변경" secondary="계정 비밀번호를 변경합니다." />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

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
              <FontAwesomeIcon icon={faGear} size="lg" />
            </ListItemIcon>
            <ListItemText primary="알림 설정" secondary="앱의 푸시 알림을 설정합니다." />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* 정보 그룹 */}
          <ListSubheader sx={subheaderStyle}>정보</ListSubheader>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faCreditCard} size="lg" />
            </ListItemIcon>
            <ListItemText primary="크레딧 관리" secondary="보유 크레딧을 확인하고 구매합니다." />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon sx={iconStyle}>
              <FontAwesomeIcon icon={faCookieBite} size="lg" />
            </ListItemIcon>
            <ListItemText primary="쿠키 및 개인정보" secondary="서비스의 쿠키 및 개인정보 처리 방침을 확인합니다." />
          </ListItemButton>
        </List>
      </Paper>
    </Container>
  );
};

export default SettingsPage;