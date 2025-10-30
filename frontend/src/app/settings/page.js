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
  Alert,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faKey,
  faPalette,
  faGear,
  faCreditCard,
  faCookieBite,
  faSync,
  faFileUpload,
} from '@fortawesome/free-solid-svg-icons';
import DarkModeSwitch from '../../components/DarkModeSwitch'; // 커스텀 스위치 import
import { api } from '@/api'; // 공용 api 인스턴스 사용

// 설정 페이지 컴포넌트
function SettingsPage() {
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [status, setStatus] = useState({ type: '', message: '' }); // 상태 메시지

  // 데이터 동기화 처리
  function handleSync(name, path) {
    setLoading(true);
    setStatus({ type: 'info', message: `${name} 동기화를 시작합니다...` });

    api
      .get(path)
      .then(function (response) {
        const resultText = response.data;
        setStatus({ type: 'success', message: resultText });
      })
      .catch(function (error) {
        const rawMessage =
          error.response?.data || error.message || `${name} 동기화에 실패했습니다.`;
        const errorMessage =
          typeof rawMessage === 'object' ? JSON.stringify(rawMessage) : rawMessage;
        setStatus({ type: 'error', message: errorMessage });
      })
      .finally(function () {
        setLoading(false);
      });
  }

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
            <ListItemText
              primary="쿠키 및 개인정보"
              secondary="서비스의 쿠키 및 개인정보 처리 방침을 확인합니다."
            />
          </ListItemButton>
        </List>
      </Paper>

      {/* 데이터 동기화 섹션 */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        데이터 동기화 (테스트용)
      </Typography>
      <Paper
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: function (theme) {
            return theme.palette.background.paper;
          },
        }}
      >
        <List>
          <ListSubheader sx={subheaderStyle}>work24 API</ListSubheader>

          <ListItem>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: 1,
              }}
            >
              {loading && <CircularProgress size={24} sx={{ mr: 2 }} />}{' '}
              {/* 로딩 중일 때 로딩 스피너 표시 */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => handleSync('공채속보', '/api/work24/sync/jobs')}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  공채속보 동기화
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSync('채용행사', '/api/work24/sync/events')}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  채용행사 동기화
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSync('기업정보', '/api/work24/sync/companies')}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  기업정보 동기화
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSync('기업정보', '/api/dart/sync/companies')}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  DART 기업정보 동기화
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleSync('CSV 업데이트', '/api/national-pension/sync/update-from-csv')
                  }
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  CSV 정보 업데이트
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSync('학교정보', '/api/manage/update/school')}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSync} style={{ marginRight: 8 }} />
                  학교정보 불러오기
                </Button>
              </Stack>
            </Box>
          </ListItem>
          {status.message && ( // 상태 메시지가 있을 경우 표시
            <ListItem sx={{ mt: 2 }}>
              <Alert severity={status.type || 'info'} sx={{ width: '100%' }}>
                {status.message}
              </Alert>
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
}

export default SettingsPage;
