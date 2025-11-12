'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import DomainVerificationRoundedIcon from '@mui/icons-material/DomainVerificationRounded';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AdminLayout from '../../../components/admin/AdminLayout';
import useManageAuthStore from '../../../store/manageAuthStore';
import { MINT_PRIMARY_DARK } from './adminTheme';
import PaymentsOverviewTab from './components/PaymentsOverviewTab';
import CommunityManagementTab from './components/CommunityManagementTab';
import CompanyApprovalTab from './components/CompanyApprovalTab';
import JobManagementTab from './components/JobManagementTab';
import InquiryManagementTab from './components/InquiryManagementTab';

const NAV_TABS = [
  { label: '결제 통계', icon: <PaymentsRoundedIcon /> },
  { label: '커뮤니티', icon: <Diversity3RoundedIcon /> },
  { label: '기업 승인', icon: <DomainVerificationRoundedIcon /> },
  { label: '공고 관리', icon: <AssignmentTurnedInIcon /> },
  { label: '1:1 문의', icon: <ForumRoundedIcon /> },
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
            color: '#475569',
            '&:hover': {
              bgcolor: 'rgba(34,211,168,0.12)',
              color: MINT_PRIMARY_DARK,
            },
          },
          '& .Mui-selected': {
            bgcolor: 'rgba(34,211,168,0.18)',
            color: MINT_PRIMARY_DARK + ' !important',
            boxShadow: 'inset 0 0 0 1px rgba(34,211,168,0.3)',
          },
        }}
      >
        {NAV_TABS.map((tab, index) => (
          <ListItem key={tab.label} disablePadding>
            <ListItemButton selected={activeTab === index} onClick={() => handleMenuSelect(index)}>
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: activeTab === index ? MINT_PRIMARY_DARK : '#94a3b8',
                  '& svg': { transition: 'transform 0.2s ease' },
                  ...(activeTab === index && { '& svg': { transform: 'scale(1.05)' } }),
                }}
              >
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
        return <PaymentsOverviewTab />;
      case 1:
        return <CommunityManagementTab />;
      case 2:
        return <CompanyApprovalTab />;
      case 3:
        return <JobManagementTab />;
      case 4:
      default:
        return <InquiryManagementTab />;
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
          <Typography variant="body2" color={MINT_PRIMARY_DARK}>
            좌측 탭에서 결제·커뮤니티·기업 승인·공고·문의 기능을 전환하세요.
          </Typography>
        </Stack>
        {renderActiveTabContent()}
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

