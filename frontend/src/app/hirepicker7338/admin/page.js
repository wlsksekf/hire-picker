"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import DomainVerificationRoundedIcon from "@mui/icons-material/DomainVerificationRounded";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import AdminLayout from "../../../components/admin/AdminLayout";
import useManageAuthStore from "../../../store/manageAuthStore";
import { MINT_PRIMARY_DARK } from "./adminTheme";
import PaymentsOverviewTab from "./components/PaymentsOverviewTab";
import CommunityManagementTab from "./components/CommunityManagementTab";
import CompanyApprovalTab from "./components/CompanyApprovalTab";
import JobManagementTab from "./components/JobManagementTab"; // 직접 임포트
import EventManagementTab from "./components/EventManagementTab"; // 직접 임포트
import InquiryManagementTab from "./components/InquiryManagementTab";

const NAV_TABS = [
  { label: "결제 통계", icon: <PaymentsRoundedIcon /> },
  { label: "커뮤니티", icon: <Diversity3RoundedIcon /> },
  { label: "기업 승인", icon: <DomainVerificationRoundedIcon /> },
  { label: "공고 관리", icon: <AssignmentTurnedInIcon /> },
  { label: "채용 행사 관리", icon: <AssignmentTurnedInIcon /> },
  { label: "1:1 문의", icon: <ForumRoundedIcon /> },
];

// ... (나머지 상수들은 변경 없음)

const AdminDashboardPage = () => {
  const router = useRouter();
  const manageUser = useManageAuthStore((state) => state.manageUser);
  const isAuthenticated = useManageAuthStore((state) => state.isAuthenticated);
  const logout = useManageAuthStore((state) => state.logout);
  const isLoading = useManageAuthStore((state) => state.isLoading);
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace("/hirepicker7338/admin/login");
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
          display: "grid",
          gap: 0.5,
          "& .MuiListItemButton-root": {
            borderRadius: 2,
            py: 1.4,
            px: 2,
            color: "#475569",
            "&:hover": {
              bgcolor: "rgba(34,211,168,0.12)",
              color: MINT_PRIMARY_DARK,
            },
          },
          "& .Mui-selected": {
            bgcolor: "rgba(34,211,168,0.18)",
            color: MINT_PRIMARY_DARK + " !important",
            boxShadow: "inset 0 0 0 1px rgba(34,211,168,0.3)",
          },
        }}
      >
        {NAV_TABS.map((tab, index) => (
          <ListItem key={tab.label} disablePadding>
            <ListItemButton
              selected={activeTab === index}
              onClick={() => handleMenuSelect(index)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: activeTab === index ? MINT_PRIMARY_DARK : "#94a3b8",
                  "& svg": { transition: "transform 0.2s ease" },
                  ...(activeTab === index && {
                    "& svg": { transform: "scale(1.05)" },
                  }),
                }}
              >
                {tab.icon}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontWeight: 600 }}
                primary={tab.label}
              />
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
        return <EventManagementTab />; // 채용 행사 관리 탭
      case 5:
        return <InquiryManagementTab />;
      default:
        return <PaymentsOverviewTab />; // 기본 탭 설정
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/hirepicker7338/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography color="text.secondary">
            관리자 권한을 확인하는 중입니다...
          </Typography>
          <LinearProgress sx={{ width: 240 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <AdminLayout
      manageUser={manageUser}
      onLogout={handleLogout}
      customMenu={sidebarMenu}
    >
      <Box sx={{ maxWidth: 1340, mx: "auto", width: "100%" }}>
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
