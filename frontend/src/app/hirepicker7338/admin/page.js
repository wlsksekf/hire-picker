'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import DomainVerificationRoundedIcon from '@mui/icons-material/DomainVerificationRounded';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AdminLayout from '../../../components/admin/AdminLayout';
import useManageAuthStore from '../../../store/manageAuthStore';

const SUMMARY_CARDS = [
  {
    title: '누적 지원자',
    value: '1,248명',
    change: '+12.4%',
    icon: <Groups2RoundedIcon />,
    gradient: '#ffffff',
  },
  {
    title: '서류 합격률',
    value: '38.5%',
    change: '+4.1%',
    icon: <InsightsRoundedIcon />,
    gradient: '#ffffff',
  },
  {
    title: '이번 주 조회수',
    value: '8,932회',
    change: '+21.7%',
    icon: <WorkHistoryRoundedIcon />,
    gradient: '#ffffff',
  },
  {
    title: '캠페인 메시지',
    value: '312건',
    change: '+8.6%',
    icon: <CampaignRoundedIcon />,
    gradient: '#ffffff',
  },
];

const NAV_TABS = [
  { label: '결제 통계', icon: <PaymentsRoundedIcon /> },
  { label: '커뮤니티', icon: <Diversity3RoundedIcon /> },
  { label: '기업 승인', icon: <DomainVerificationRoundedIcon /> },
  { label: '공고 관리', icon: <AssignmentTurnedInIcon /> },
  { label: '1:1 문의', icon: <ForumRoundedIcon /> },
];

const MINT_MAIN = '#1f2937';

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

const COMMUNITY_MEMBERS = [
  { name: '박소은', role: '커뮤니티 매니저', activity: '주간 인기 포스트', status: '활성', avatar: 'PS' },
  { name: '유재혁', role: '신규 멤버', activity: '멘토링 신청', status: '검토', avatar: 'YJ' },
  { name: '김도연', role: '일반 회원', activity: '자료 공유 12건', status: '활성', avatar: 'KD' },
];

const COMPANY_APPROVALS = [
  { company: '스파크랩', contact: '이정훈 팀장', submitted: '2025-11-09', status: '서류 확인 중' },
  { company: '메이플소프트', contact: '권예린 HR', submitted: '2025-11-08', status: '전화 미팅 예정' },
  { company: 'AI웍스', contact: '조현우 대표', submitted: '2025-11-07', status: '추가 서류 요청' },
];

const JOB_MANAGEMENT = [
  { title: '백엔드 시니어 엔지니어', company: '루키랩스', due: 'D-3', applicants: 42, status: '검토중' },
  { title: 'UX/UI 디자이너', company: '메이플소프트', due: 'D-7', applicants: 28, status: '채용중' },
  { title: 'AI Researcher', company: 'AI웍스', due: 'D-14', applicants: 12, status: '대기' },
];

const DIRECT_INQUIRIES = [
  { from: '오혜림', topic: '크레딧 환불 문의', time: '7분 전', priority: '높음' },
  { from: '정석훈', topic: '회사 소개 등록 요청', time: '55분 전', priority: '보통' },
  { from: '이우빈', topic: '결제서류 발급', time: '어제', priority: '낮음' },
];

const RECENT_ALERTS = [
  { id: 1, message: '크레딧 환불 문의 처리', time: '7분 전' },
  { id: 2, message: '회사 소개 등록 요청 처리', time: '55분 전' },
  { id: 3, message: '결제서류 발급 처리', time: '어제' },
];

const AdminDashboardPage = () => {
  const router = useRouter();
  const manageUser = useManageAuthStore((state) => state.manageUser);
  const isAuthenticated = useManageAuthStore((state) => state.isAuthenticated);
  const logout = useManageAuthStore((state) => state.logout);
  const isLoading = useManageAuthStore((state) => state.isLoading);
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace('/hirepicker7338/admin/login');
  };

  const handleMenuSelect = (index) => {
    setActiveTab(index);
  };

  const sidebarMenu = (
    <>
      <Divider />
      <List
        sx={{
          mt: 3,
          display: 'grid',
          gap: 0.5,
          '& .MuiListItemButton-root': {
            borderRadius: 2,
            py: 1.4,
            px: 2,
            color: '#4b5563',
            '&:hover': {
              bgcolor: 'rgba(17,24,39,0.05)',
            },
          },
          '& .Mui-selected': {
            bgcolor: 'rgba(17,24,39,0.08)',
            color: '#111827 !important',
          },
        }}
      >
        {NAV_TABS.map((tab, index) => (
          <ListItem key={tab.label} disablePadding>
            <ListItemButton selected={activeTab === index} onClick={() => handleMenuSelect(index)}>
              <ListItemIcon sx={{ minWidth: 36, color: activeTab === index ? '#111827' : '#9ca3af' }}>
                {tab.icon}
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontWeight: 600 }} primary={tab.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
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
                      border: '1px solid rgba(17,24,39,0.06)',
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
                          bgcolor: '#f3f4f6',
                          color: '#1f2937',
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
                        backgroundColor: '#f3f4f6',
                        color: '#1f2937',
                        fontWeight: 600,
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper
                  id="credit"
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background: '#ffffff',
                    border: '1px solid rgba(17,24,39,0.06)',
                    boxShadow: '0 18px 32px -28px rgba(17,24,39,0.35)',
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
                      <Chip label="실시간 동기화" size="small" sx={{ fontWeight: 600, bgcolor: '#eef2f7', color: '#1f2937' }} />
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
                              background: '#d1d5db',
                              boxShadow: '0 12px 20px -18px rgba(17,24,39,0.3)',
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
                                background: '#9ca3af',
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
                      <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: '#f3f4f6' }}>
                        <Typography variant="body2" color="#1f2937" fontWeight={700}>
                          이번 달 결제 총액
                        </Typography>
                        <Typography variant="h4" fontWeight={800} mt={0.5} color="#111827">
                          ₩ 6,600,000
                        </Typography>
                        <Chip label="+18% vs 지난달" size="small" sx={{ mt: 1, bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 600 }} />
                      </Box>
                      <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, bgcolor: '#f3f4f6' }}>
                        <Typography variant="body2" color="#1f2937" fontWeight={700}>
                          환불 비율
                        </Typography>
                        <Typography variant="h4" fontWeight={800} mt={0.5} color="#111827">
                          3.2%
                        </Typography>
                        <Chip label="-1.1% vs 지난달" size="small" sx={{ mt: 1, bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 600 }} />
                      </Box>
                    </Stack>
                    <Divider flexItem sx={{ borderStyle: 'dashed', borderColor: 'rgba(17,24,39,0.08)' }} />
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700} color="#111827">
                          최근 결제 활동
                        </Typography>
                        <Button size="small" sx={{ textTransform: 'none', fontWeight: 600, color: '#1f2937' }}>
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
                              borderColor: 'rgba(17,24,39,0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 2,
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
                      boxShadow: '0 18px 32px -30px rgba(17,24,39,0.35)',
                      background: '#ffffff',
                      border: '1px solid rgba(17,24,39,0.06)',
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
                        <Chip label="+6.5% vs 지난 분기" size="small" sx={{ bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 600 }} />
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
                            <TrendingUpIcon sx={{ color: '#1f2937', fontSize: 18 }} />
                          </Stack>
                          <LinearProgress variant="determinate" value={41} sx={{ mt: 1, height: 10, borderRadius: 5 }} color="success" />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="#6b7280">
                            첫 결제 → 프리미엄 전환
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h5" fontWeight={700} color="#111827">
                              27%
                            </Typography>
                            <TrendingUpIcon sx={{ color: '#1f2937', fontSize: 18 }} />
                          </Stack>
                          <LinearProgress variant="determinate" value={27} sx={{ mt: 1, height: 10, borderRadius: 5 }} color="warning" />
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      boxShadow: '0 18px 32px -30px rgba(17,24,39,0.3)',
                      background: '#f9fafb',
                      border: '1px solid rgba(17,24,39,0.06)',
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
      case 1:
        return (
          <Paper
            id="community"
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
                <Button size="small" sx={{ textTransform: 'none', color: '#1f2937', fontWeight: 600 }}>
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
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="#111827">
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          {member.role} · {member.activity}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip label={member.status} size="small" color={member.status === '활성' ? 'success' : 'warning'} sx={{ fontWeight: 600 }} />
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        );
      case 2:
        return (
          <Paper
            id="company"
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
                <Button size="small" sx={{ textTransform: 'none', color: '#1f2937', fontWeight: 600 }}>
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
      case 3:
        return (
          <Paper
            id="jobs"
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
                <Button size="small" sx={{ textTransform: 'none', color: '#1f2937', fontWeight: 600 }}>
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
                        <Button size="small" sx={{ textTransform: 'none', color: '#1f2937' }}>
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
      case 4:
      default:
        return (
          <Paper
            id="inquiry"
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
                <Button size="small" sx={{ textTransform: 'none', color: '#1f2937', fontWeight: 600 }}>
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
                        <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, color: '#1f2937' }}>
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
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/hirepicker7338/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="text.secondary">관리자 권한을 확인하는 중입니다...</Typography>
          <LinearProgress sx={{ width: 240 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <AdminLayout manageUser={manageUser} onLogout={handleLogout} customMenu={sidebarMenu}>
      <Box sx={{ maxWidth: 1340, mx: 'auto', width: '100%' }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" fontWeight={800} color="#0f172a">
            HirePicker Admin
          </Typography>
          <Typography variant="body2" color={MINT_MAIN}>
            좌측 탭에서 결제·커뮤니티·기업 승인·공고·문의 기능을 전환하세요.
          </Typography>
        </Stack>
        {renderActiveTabContent()}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

