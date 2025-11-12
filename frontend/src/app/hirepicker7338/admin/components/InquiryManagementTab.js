'use client';

import {
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { MINT_PRIMARY_DARK } from '../adminTheme';

const DIRECT_INQUIRIES = [
  { from: '오혜림', topic: '크레딧 환불 문의', time: '7분 전', priority: '높음' },
  { from: '정석훈', topic: '회사 소개 등록 요청', time: '55분 전', priority: '보통' },
  { from: '이우빈', topic: '결제서류 발급', time: '어제', priority: '낮음' },
];

export default function InquiryManagementTab() {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        boxShadow: '0 18px 32px -30px rgba(17,24,39,0.3)',
        background: '#ffffff',
        border: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} color="#111827">
            1:1 문의 관리
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            문의함 열기
          </Button>
        </Stack>

        <Stack spacing={2}>
          {DIRECT_INQUIRIES.map((item) => (
            <Paper
              key={item.from}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 2.5,
                borderColor: 'rgba(17,24,39,0.08)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    {item.from}
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    {item.topic}
                  </Typography>
                  <Typography variant="caption" color="#9ca3af">
                    {item.time}
                  </Typography>
                </Stack>
                <Stack spacing={1} alignItems="flex-end">
                  <Chip
                    label={item.priority}
                    size="small"
                    color={item.priority === '높음' ? 'error' : item.priority === '보통' ? 'warning' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                  <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, color: MINT_PRIMARY_DARK }}>
                    응답 작성
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}


