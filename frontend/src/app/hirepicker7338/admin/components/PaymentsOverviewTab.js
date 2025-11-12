'use client';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import { MINT_PRIMARY, MINT_PRIMARY_DARK, MINT_SURFACE } from '../adminTheme';

const SUMMARY_CARDS = [
  {
    title: '누적 지원자',
    value: '1,248명',
    change: '+12.4%',
    icon: <Groups2RoundedIcon />,
    gradient: `linear-gradient(135deg, ${MINT_SURFACE} 0%, #ffffff 100%)`,
  },
  {
    title: '서류 합격률',
    value: '38.5%',
    change: '+4.1%',
    icon: <InsightsRoundedIcon />,
    gradient: `linear-gradient(135deg, rgba(34,211,168,0.18) 0%, #ffffff 90%)`,
  },
  {
    title: '이번 주 조회수',
    value: '8,932회',
    change: '+21.7%',
    icon: <WorkHistoryRoundedIcon />,
    gradient: `linear-gradient(135deg, #ffffff 10%, rgba(94,234,212,0.25) 100%)`,
  },
  {
    title: '캠페인 메시지',
    value: '312건',
    change: '+8.6%',
    icon: <CampaignRoundedIcon />,
    gradient: `linear-gradient(135deg, rgba(20,184,166,0.15) 0%, #ffffff 90%)`,
  },
];

const CREDIT_SERIES = [
  { month: '1월', amount: 4200, refunds: 180 },
  { month: '2월', amount: 4800, refunds: 140 },
  { month: '3월', amount: 5300, refunds: 160 },
  { month: '4월', amount: 6100, refunds: 120 },
  { month: '5월', amount: 5900, refunds: 210 },
  { month: '6월', amount: 6600, refunds: 190 },
];

const PAYMENT_ACTIVITY = [
  { title: 'Premium Credit Pack', buyer: '정민수', amount: '+ ₩240,000', time: '3분 전' },
  { title: '기업 부스 패키지', buyer: '루키랩스', amount: '+ ₩890,000', time: '1시간 전' },
  { title: '캠페인 리콜', buyer: '박유진', amount: '- ₩35,000', time: '2시간 전' },
];

const RECENT_ALERTS = [
  { id: 1, message: '크레딧 환불 문의 처리', time: '7분 전' },
  { id: 2, message: '회사 소개 등록 요청 처리', time: '55분 전' },
  { id: 3, message: '결제서류 발급 처리', time: '어제' },
];

export default function PaymentsOverviewTab() {
  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        {SUMMARY_CARDS.map((card) => (
          <Grid key={card.title} item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                boxShadow: '0 10px 24px -20px rgba(17,24,39,0.25)',
                background: card.gradient,
                border: '1px solid rgba(34,211,168,0.25)',
                color: '#111827',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'rgba(34,211,168,0.15)',
                    color: MINT_PRIMARY_DARK,
                    border: `1px solid rgba(34,211,168,0.35)`,
                    fontWeight: 700,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#111827">
                    {card.value}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={card.change}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(34,211,168,0.15)',
                  color: MINT_PRIMARY_DARK,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  px: 1.2,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: '#ffffff',
              border: '1px solid rgba(34,211,168,0.18)',
              boxShadow: '0 18px 32px -28px rgba(15,118,110,0.25)',
            }}
          >
            <Stack spacing={4}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#111827">
                    크레딧 결제 내역 통계
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    최근 6개월간 결제 실적과 환불 동향입니다.
                  </Typography>
                </Box>
                <Chip
                  label="실시간 동기화"
                  size="small"
                  sx={{ fontWeight: 600, bgcolor: 'rgba(34,211,168,0.16)', color: MINT_PRIMARY_DARK, borderRadius: 1.5 }}
                />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                  gap: 2,
                  alignItems: 'end',
                }}
              >
                {CREDIT_SERIES.map((item) => (
                  <Stack key={item.month} spacing={1.2} alignItems="center">
                    <Box
                      sx={{
                        width: '70%',
                        height: `${item.amount / 45}px`,
                        borderRadius: 3,
                        background: 'linear-gradient(180deg, rgba(34,211,168,0.7) 0%, rgba(15,118,110,0.9) 100%)',
                        boxShadow: '0 12px 20px -18px rgba(15,118,110,0.4)',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '55%',
                          height: `${item.refunds / 8}px`,
                          borderRadius: 3,
                          background: 'rgba(14,165,233,0.55)',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="#6b7280">
                      {item.month}
                    </Typography>
                  </Stack>
                ))}
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: 'rgba(34,211,168,0.12)' }}>
                  <Typography variant="body2" color={MINT_PRIMARY_DARK} fontWeight={700}>
                    이번 달 결제 총액
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={0.5} color="#0f172a">
                    ₩ 6,600,000
                  </Typography>
                  <Chip
                    label="+18% vs 지난달"
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(34,211,168,0.18)', color: MINT_PRIMARY_DARK, fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: 'rgba(34,211,168,0.12)' }}>
                  <Typography variant="body2" color={MINT_PRIMARY_DARK} fontWeight={700}>
                    환불 비율
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={0.5} color="#0f172a">
                    3.2%
                  </Typography>
                  <Chip
                    label="-1.1% vs 지난달"
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(94,234,212,0.25)', color: MINT_PRIMARY_DARK, fontWeight: 600 }}
                  />
                </Box>
              </Stack>

              <Divider flexItem sx={{ borderStyle: 'dashed', borderColor: 'rgba(17,24,39,0.08)' }} />

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    최근 결제 활동
                  </Typography>
                  <Button
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#0f172a',
                      borderRadius: 2,
                      px: 2,
                      backgroundColor: 'rgba(34,211,168,0.16)',
                      '&:hover': { backgroundColor: 'rgba(34,211,168,0.25)' },
                    }}
                  >
                    결제 관리 바로가기
                  </Button>
                </Stack>
                <List disablePadding sx={{ display: 'grid', gap: 1.5 }}>
                  {PAYMENT_ACTIVITY.map((activity, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 2,
                        borderColor: 'rgba(34,211,168,0.22)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        background: 'linear-gradient(135deg, rgba(34,211,168,0.08) 0%, #ffffff 100%)',
                      }}
                    >
                      <Stack>
                        <Typography variant="subtitle2" fontWeight={700} color="#111827">
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          {activity.buyer}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={activity.amount.startsWith('+') ? '#166534' : '#991b1b'}
                        >
                          {activity.amount}
                        </Typography>
                        <Typography variant="caption" color="#6b7280">
                          {activity.time}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </List>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                boxShadow: '0 18px 32px -30px rgba(15,118,110,0.22)',
                background: '#ffffff',
                border: '1px solid rgba(34,211,168,0.18)',
              }}
            >
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700} color="#111827">
                  결제 KPI
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="#6b7280">
                    평균 결제 단가
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#111827">
                    ₩ 82,500
                  </Typography>
                  <Chip
                    label="+6.5% vs 지난 분기"
                    size="small"
                    sx={{ bgcolor: 'rgba(34,211,168,0.18)', color: MINT_PRIMARY_DARK, fontWeight: 600 }}
                  />
                </Stack>
                <Divider />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" color="#6b7280">
                      재구매율
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        41%
                      </Typography>
                      <TrendingUpIcon sx={{ color: MINT_PRIMARY_DARK, fontSize: 18 }} />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={41}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(94,234,212,0.25)',
                        '& .MuiLinearProgress-bar': { bgcolor: MINT_PRIMARY_DARK },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="#6b7280">
                      첫 결제 → 프리미엄 전환
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        27%
                      </Typography>
                      <TrendingUpIcon sx={{ color: MINT_PRIMARY_DARK, fontSize: 18 }} />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={27}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(34,211,168,0.18)',
                        '& .MuiLinearProgress-bar': { bgcolor: MINT_PRIMARY },
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 18px 32px -30px rgba(15,118,110,0.2)',
                background: '#f9fafb',
                border: '1px solid rgba(34,211,168,0.16)',
                color: '#111827',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                  이번 주 알림 요약
                </Typography>
                <Stack spacing={1.5}>
                  {RECENT_ALERTS.map((alert) => (
                    <Box key={alert.id}>
                      <Typography variant="body2" fontWeight={600}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {alert.time}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}


