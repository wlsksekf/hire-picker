'use client';

import React, { useState } from 'react';
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
  TextField,
  Button,
  Stack,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faKey,
  faPalette,
  faGear,
  faCreditCard,
  faCookieBite,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import DarkModeSwitch from '../../components/DarkModeSwitch'; // 커스텀 스위치 import

function SettingsPage() {

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  async function handleSync(type) {
    setLoading(true);
    setStatus({ type: 'info', message: `${type} 동기화를 시작합니다...` });

    try {
      // API 키 없이 백엔드 동기화 API 호출
      const response = await fetch(`/api/work24/sync/${type}`);
      
      if (!response.ok) {
        // 백엔드에서 받은 에러 메시지를 텍스트로 읽음
        const errorText = await response.text();
        throw new Error(errorText || `${type} 동기화에 실패했습니다.`);
      }

      const resultText = await response.text();
      setStatus({ type: 'success', message: resultText });

    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }

  const iconStyle = {
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    color: 'text.secondary'
  };

  const subheaderStyle = {
    fontWeight: 'bold',
    color: function(theme) { return theme.palette.text.secondary },
    backgroundColor: 'transparent'
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        설정
      </Typography>
      <Paper sx={{ 
        mt: 2,
        backgroundColor: function(theme) { return theme.palette.background.paper }
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

      {/* 데이터 동기화 섹션 */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        데이터 동기화 (테스트용)
      </Typography>
      <Paper sx={{ 
        mt: 2,
        p: 2,
        backgroundColor: function(theme) { return theme.palette.background.paper }
      }}>
        <List>
          <ListSubheader sx={subheaderStyle}>work24 API</ListSubheader>

          <ListItem>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
              {loading && <CircularProgress size={24} sx={{ mr: 2 }} />}
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={function() { return handleSync('jobs') }} disabled={loading}>
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  공채속보 동기화
                </Button>
                <Button variant="contained" onClick={function() { return handleSync('events') }} disabled={loading}>
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  채용행사 동기화
                </Button>
                <Button variant="contained" onClick={function() { return handleSync('companies') }} disabled={loading}>
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  기업정보 동기화
                </Button>
              </Stack>
            </Box>
          </ListItem>
          {status.message && (
            <ListItem sx={{ mt: 2 }}>
              <Alert severity={status.type || 'info'} sx={{ width: '100%' }}>{status.message}</Alert>
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
}

export default SettingsPage;
