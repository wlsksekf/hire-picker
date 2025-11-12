'use client';

import {
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { MINT_PRIMARY_DARK } from '../adminTheme';

const JOB_MANAGEMENT = [
  { title: '백엔드 시니어 엔지니어', company: '루키랩스', due: 'D-3', applicants: 42, status: '검토중' },
  { title: 'UX/UI 디자이너', company: '메이플소프트', due: 'D-7', applicants: 28, status: '채용중' },
  { title: 'AI Researcher', company: 'AI웍스', due: 'D-14', applicants: 12, status: '대기' },
];

export default function JobManagementTab() {
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
            공고 관리
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            공고 새로 만들기
          </Button>
        </Stack>

        <Stack spacing={2}>
          {JOB_MANAGEMENT.map((job) => (
            <Paper
              key={job.title}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 2.5,
                borderColor: 'rgba(17,24,39,0.08)',
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    {job.title}
                  </Typography>
                  <Chip label={job.due} size="small" sx={{ fontWeight: 600, bgcolor: '#e5e7eb', color: '#1f2937' }} />
                </Stack>
                <Typography variant="body2" color="#6b7280">
                  {job.company} · 지원자 {job.applicants}명
                </Typography>
                <LinearProgress variant="determinate" value={Math.min(job.applicants * 2, 100)} sx={{ height: 8, borderRadius: 4 }} color="success" />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip label={job.status} size="small" sx={{ bgcolor: '#f3f4f6', fontWeight: 600, borderRadius: 2, color: '#1f2937' }} />
                  <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK }}>
                    세부 관리
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


