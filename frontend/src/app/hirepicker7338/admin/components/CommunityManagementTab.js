'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { MINT_PRIMARY_DARK } from '../adminTheme';

// 날짜 포맷 함수
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return isNaN(d.getTime())
    ? isoString
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ReportListTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/report')
      .then((res) => res.json())
      .then((data) => {
        const arrayData = Array.isArray(data) ? data : (data.reports || []);
        setReports(arrayData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 항상 배열로 map
  const reportArray = Array.isArray(reports) ? reports : [];

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        boxShadow: '0 18px 32px -30px rgba(17,24,39,0.3)',
        background: '#fff',
        border: '1px solid rgba(17,24,39,0.06)'
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} color="#111827">
            신고 내역 전체 보기
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            커뮤니티 센터 이동
          </Button>
        </Stack>
        <Stack spacing={2}>
          {loading ? (
            <CircularProgress size={32} sx={{ mx: 'auto' }} />
          ) : reportArray.length === 0 ? (
            <Typography color="#6b7280" align="center">신고 내역이 없습니다.</Typography>
          ) : (
            reportArray.map((report) => (
              <Paper
                key={report.reportHistoryIdx}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  borderColor: 'rgba(17,24,39,0.08)'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#f3f4f6',
                    color: '#1f2937',
                    fontWeight: 700,
                  }}>
                    {report.nickname ? report.nickname.charAt(0) : '?'}
                  </Avatar>
                  <Stack spacing={0.2}>
                    <Typography variant="subtitle1" fontWeight={700} color="#111827">
                      신고당한 사람: {report.nickname || '알수없음'}
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      신고 사유: {report.reason}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="#9ca3af">
                  신고일자: {formatDate(report.reportDate)}
                </Typography>
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
