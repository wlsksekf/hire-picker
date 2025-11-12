'use client';

import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAdminPaymentStatistics } from '@/api';
import { MINT_PRIMARY, MINT_PRIMARY_DARK, MINT_SURFACE } from '../adminTheme';

// 그래프 색상 팔레트
const CHART_COLORS = [
  'rgba(34,211,168,0.8)',  // MINT_PRIMARY
  'rgba(15,118,110,0.8)',  // MINT_PRIMARY_DARK
  'rgba(94,234,212,0.8)',  // MINT_SURFACE
  'rgba(20,184,166,0.8)',
  'rgba(14,165,233,0.8)',
];

const PIE_COLORS = [
  '#22d3a4',  // MINT_PRIMARY
  '#0f766e',  // MINT_PRIMARY_DARK
  '#5eead4',  // MINT_SURFACE
  '#14b8a6',
  '#0ea5e9',
];

export default function PaymentsOverviewTab() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminPaymentStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('결제 통계 조회 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 숫자 포맷팅 헬퍼
  const formatNumber = (num) => {
    if (num == null) return '0';
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 백엔드에서 이미 원화 단위로 반환하므로 변환 불필요
  // (주석 처리: 이전에는 크레딧 단위였지만, 현재는 Payment.amount를 직접 사용)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: MINT_PRIMARY_DARK }} />
          <Typography color="#6b7280">데이터를 불러오는 중...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !statistics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={2} alignItems="center">
          <Typography color="error">{error || '데이터를 불러올 수 없습니다.'}</Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchStatistics}
            sx={{
              bgcolor: MINT_PRIMARY_DARK,
              '&:hover': { bgcolor: MINT_PRIMARY },
            }}
          >
            다시 시도
          </Button>
        </Stack>
      </Box>
    );
  }

  const { summaryCards, monthlyStats, typeStats, recentActivities, kpiMetrics } = statistics;

  // 요약 카드 데이터
  const summaryCardsData = [
    {
      title: '총 거래 건수',
      value: `${formatNumber(summaryCards?.totalTransactions || 0)}건`,
      icon: <ReceiptIcon />,
      gradient: `linear-gradient(135deg, ${MINT_SURFACE} 0%, #ffffff 100%)`,
    },
    {
      title: '총 수익',
      value: `₩ ${formatNumber(summaryCards?.totalRevenue || 0)}`,
      icon: <AccountBalanceWalletIcon />,
      gradient: `linear-gradient(135deg, rgba(34,211,168,0.18) 0%, #ffffff 90%)`,
    },
    {
      title: '환불 건수',
      value: `${formatNumber(summaryCards?.totalRefunds || 0)}건`,
      icon: <RefreshIcon />,
      gradient: `linear-gradient(135deg, #ffffff 10%, rgba(94,234,212,0.25) 100%)`,
    },
    {
      title: '환불률',
      value: `${(summaryCards?.refundRate || 0).toFixed(1)}%`,
      icon: <TrendingUpIcon />,
      gradient: `linear-gradient(135deg, rgba(20,184,166,0.15) 0%, #ffffff 90%)`,
    },
  ];

  // 월별 차트 데이터 준비
  const chartData = (monthlyStats || []).map((stat) => ({
    month: stat.monthLabel,
    거래액: stat.totalAmount || 0,
    환불액: stat.refundAmount || 0,
  }));

  // 타입별 파이 차트 데이터 준비
  const pieData = (typeStats || []).map((stat) => ({
    name: stat.typeLabel,
    value: stat.totalAmount || 0,
    count: stat.transactionCount || 0,
  }));

  // 이번 달 vs 지난 달 비교
  const currentMonth = monthlyStats?.[monthlyStats.length - 1];
  const previousMonth = monthlyStats?.[monthlyStats.length - 2];
  const monthGrowth = currentMonth && previousMonth && previousMonth.totalAmount > 0
    ? ((currentMonth.totalAmount - previousMonth.totalAmount) / previousMonth.totalAmount * 100).toFixed(1)
    : '0.0';

  return (
    <Stack spacing={4}>
      {/* 요약 카드 */}
      <Grid container spacing={3}>
        {summaryCardsData.map((card) => (
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
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 월별 통계 차트 */}
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

              {/* 월별 바 차트 */}
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,168,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(34,211,168,0.2)',
                        borderRadius: 8,
                      }}
                      formatter={(value) => formatNumber(value)}
                    />
                    <Legend />
                    <Bar dataKey="거래액" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="환불액" fill={CHART_COLORS[4]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* 이번 달 요약 */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: 'rgba(34,211,168,0.12)' }}>
                  <Typography variant="body2" color={MINT_PRIMARY_DARK} fontWeight={700}>
                    이번 달 결제 총액
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={0.5} color="#0f172a">
                    ₩ {formatNumber(currentMonth?.totalAmount || 0)}
                  </Typography>
                  <Chip
                    label={`${monthGrowth >= 0 ? '+' : ''}${monthGrowth}% vs 지난달`}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(34,211,168,0.18)', color: MINT_PRIMARY_DARK, fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: 'rgba(34,211,168,0.12)' }}>
                  <Typography variant="body2" color={MINT_PRIMARY_DARK} fontWeight={700}>
                    환불 비율
                  </Typography>
                  <Typography variant="h4" fontWeight={800} mt={0.5} color="#0f172a">
                    {(summaryCards?.refundRate || 0).toFixed(1)}%
                  </Typography>
                  <Chip
                    label="전체 기준"
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(94,234,212,0.25)', color: MINT_PRIMARY_DARK, fontWeight: 600 }}
                  />
                </Box>
              </Stack>

              <Divider flexItem sx={{ borderStyle: 'dashed', borderColor: 'rgba(17,24,39,0.08)' }} />

              {/* 최근 결제 활동 */}
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700} color="#111827">
                    최근 결제 활동
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={fetchStatistics}
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
                    새로고침
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {(recentActivities || []).slice(0, 5).map((activity, idx) => (
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
                          {activity.typeLabel}
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          {activity.userName}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Typography variant="subtitle2" fontWeight={700} color="#166534">
                          + {formatNumber(activity.amount)} 크레딧
                        </Typography>
                        <Typography variant="caption" color="#6b7280">
                          {activity.timeAgo}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                  {(!recentActivities || recentActivities.length === 0) && (
                    <Typography variant="body2" color="#6b7280" textAlign="center" py={2}>
                      최근 결제 내역이 없습니다.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* 타입별 통계 및 KPI */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* 타입별 파이 차트 */}
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
                  결제 타입별 분포
                </Typography>
                {pieData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body2" color="#6b7280" textAlign="center" py={4}>
                    데이터가 없습니다.
                  </Typography>
                )}
                <Divider />
                <Stack spacing={1.5}>
                  {(typeStats || []).map((stat, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" color="#6b7280">
                          {stat.typeLabel}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#111827">
                          ₩ {formatNumber(stat.totalAmount)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={stat.percentage || 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(94,234,212,0.25)',
                          '& .MuiLinearProgress-bar': { bgcolor: PIE_COLORS[idx % PIE_COLORS.length] },
                        }}
                      />
                      <Typography variant="caption" color="#6b7280" mt={0.5}>
                        {stat.transactionCount}건 ({stat.percentage?.toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* KPI 지표 */}
            <Paper
              sx={{
                p: 3,
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
                    평균 거래 단가
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#111827">
                    {formatNumber(kpiMetrics?.averageTransactionAmount || 0)} 크레딧
                  </Typography>
                </Stack>
                <Divider />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" color="#6b7280">
                      재구매율
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        {(kpiMetrics?.repeatPurchaseRate || 0).toFixed(1)}%
                      </Typography>
                      <TrendingUpIcon sx={{ color: MINT_PRIMARY_DARK, fontSize: 18 }} />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={kpiMetrics?.repeatPurchaseRate || 0}
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
                      전환율
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h5" fontWeight={700} color="#111827">
                        {(kpiMetrics?.conversionRate || 0).toFixed(1)}%
                      </Typography>
                      <TrendingUpIcon sx={{ color: MINT_PRIMARY, fontSize: 18 }} />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={kpiMetrics?.conversionRate || 0}
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
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
