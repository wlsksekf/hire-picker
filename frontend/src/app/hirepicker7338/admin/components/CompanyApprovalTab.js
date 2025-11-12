'use client';

import {
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import { MINT_PRIMARY_DARK } from '../adminTheme';

const COMPANY_APPROVALS = [
  { company: '스파크랩', contact: '이정훈 팀장', submitted: '2025-11-09', status: '서류 확인 중' },
  { company: '메이플소프트', contact: '권예린 HR', submitted: '2025-11-08', status: '전화 미팅 예정' },
  { company: 'AI웍스', contact: '조현우 대표', submitted: '2025-11-07', status: '추가 서류 요청' },
];

export default function CompanyApprovalTab() {
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
            기업회원 가입 승인
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            전체 신청 보기
          </Button>
        </Stack>

        <Stack spacing={2}>
          {COMPANY_APPROVALS.map((item) => (
            <Paper
              key={item.company}
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
                    {item.company}
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    담당자 {item.contact} · 접수일 {item.submitted}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{ bgcolor: '#e5e7eb', fontWeight: 600, borderRadius: 2, color: '#1f2937' }}
                    icon={<PendingActionsRoundedIcon fontSize="small" />}
                  />
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2, color: '#1f2937' }}>
                    검토
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


