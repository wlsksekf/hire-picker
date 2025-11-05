'''// 1:1 문의 목록 페이지는 데이터를 불러오고 상태에 따라 UI가 바뀌므로 클라이언트 컴포넌트로 선언
'use client';

import React from 'react';
import { Container, Typography, Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import Link from 'next/link';

// API가 준비되기 전까지 사용할 임시 데이터
const createData = (id, category, title, status, date) => {
  return { id, category, title, status, date };
};

const rows = [
  createData(1, '결제', '크레딧 결제가 정상적으로 처리되지 않았습니다.', 'ANSWERED', '2025-11-04'),
  createData(2, '오류 신고', '이력서 저장 시 500 에러가 발생합니다.', 'PENDING', '2025-11-05'),
  createData(3, '계정', '비밀번호를 잊어버렸습니다.', 'ANSWERED', '2025-10-28'),
];

// 문의 상태에 따라 색상 점 아이콘을 반환하는 함수
const StatusIcon = ({ status }) => {
  const color = status === 'ANSWERED' ? 'success.main' : 'warning.main';
  return (
    <Box sx={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color,
      mr: 1,
    }} />
  );
};

// '토스/당근' 스타일의 1:1 문의 목록 페이지
const InquiryListPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          나의 문의 내역
        </Typography>
        <Link href="/support/inquiries/new" passHref>
          <Button variant="contained">
            문의 등록하기
          </Button>
        </Link>
      </Box>

      {/* 문의 내역 리스트 (테이블 대신 사용) */}
      <Paper variant="outlined">
        <List disablePadding>
          {rows.map((row, index) => (
            <Link key={row.id} href={`/support/inquiries/${row.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton component="a" divider={index < rows.length - 1}>
                <ListItemIcon>
                  <StatusIcon status={row.status} />
                </ListItemIcon>
                <ListItemText
                  primary={row.title}
                  primaryTypographyProps={{ fontWeight: 'medium', component: 'div', noWrap: true, textOverflow: 'ellipsis' }}
                  secondary={`${row.category} · ${row.date}`}
                />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default InquiryListPage;
'''