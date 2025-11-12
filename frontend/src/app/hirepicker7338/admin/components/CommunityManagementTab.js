'use client';

import {
  Avatar,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { MINT_PRIMARY_DARK } from '../adminTheme';

const COMMUNITY_MEMBERS = [
  { name: '박소은', role: '커뮤니티 매니저', activity: '주간 인기 포스트', status: '활성', avatar: 'PS' },
  { name: '유재혁', role: '신규 멤버', activity: '멘토링 신청', status: '검토', avatar: 'YJ' },
  { name: '김도연', role: '일반 회원', activity: '자료 공유 12건', status: '활성', avatar: 'KD' },
];

export default function CommunityManagementTab() {
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
            커뮤니티 회원 관리
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            커뮤니티 센터 이동
          </Button>
        </Stack>

        <Stack spacing={2}>
          {COMMUNITY_MEMBERS.map((member) => (
            <Paper
              key={member.name}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                borderColor: 'rgba(17,24,39,0.08)',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#f3f4f6',
                    color: '#1f2937',
                    fontWeight: 700,
                  }}
                >
                  {member.avatar}
                </Avatar>
                <Stack spacing={0.2}>
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    {member.role} · {member.activity}
                  </Typography>
                </Stack>
              </Stack>
              <Chip
                label={member.status}
                size="small"
                color={member.status === '활성' ? 'success' : 'warning'}
                sx={{ fontWeight: 600 }}
              />
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}


