import PropTypes from 'prop-types';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import styled from 'styled-components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const drawerWidth = 270;

const defaultMenuItems = [
  { label: '대시보드', icon: <DashboardIcon />, href: '/hirepicker7338/admin' },
  { label: '채용 공고', icon: <ArticleIcon />, href: '/hirepicker7338/admin/jobs' },
  { label: '지원자 관리', icon: <PeopleIcon />, href: '/hirepicker7338/admin/applicants' },
];

const AdminLayout = ({ children, manageUser, onLogout, customMenu }) => (
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6f8' }}>
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(17,24,39,0.06)',
          px: 2.5,
          py: 3,
        },
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1f2937',
              boxShadow: '0 14px 24px rgba(17,24,39,0.08)',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#fff">
              HP
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#111827">
              HirePicker
            </Typography>
            <Typography variant="caption" color="#6b7280">
              Admin Console
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      {customMenu ? (
        customMenu
      ) : (
        <>
          <Divider />
          <List sx={{ mt: 3, display: 'grid', gap: 0.5 }}>
            {defaultMenuItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component="a"
                  href={item.href}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.4,
                    px: 2,
                    color: '#374151',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(17,24,39,0.08)',
                      color: '#111827',
                      '& .MuiListItemIcon-root': {
                        color: '#111827',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(17,24,39,0.05)',
                    },
                  }}
                  selected={item.href === '/hirepicker7338/admin'}
                >
                  <ListItemIcon sx={{ color: '#9ca3af', minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Box
        sx={{
          mt: 6,
          p: 2.2,
          borderRadius: 3,
          backgroundColor: '#f9fafb',
          color: '#374151',
          border: '1px solid rgba(17,24,39,0.05)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          시스템 상태
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <FiberManualRecordIcon sx={{ fontSize: 12, color: '#22c55e' }} />
          <Typography variant="caption">서비스 정상 작동 중</Typography>
        </Box>
      </Box>
    </Drawer>

    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: `${drawerWidth}px`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          color: '#111827',
          borderBottom: '1px solid rgba(17,24,39,0.06)',
          boxShadow: '0 10px 18px -14px rgba(15,23,42,0.15)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: 76,
            px: 5,
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <TextField
            placeholder="검색 (Ctrl + K)"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                color: '#111827',
                bgcolor: '#f9fafb',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(17,24,39,0.12)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1f2937',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <IconButton sx={{ color: '#4b5563' }}>
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton sx={{ color: '#4b5563' }}>
              <SettingsOutlinedIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(148,163,184,0.35)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#e5e7eb',
                  color: '#1f2937',
                  fontWeight: 600,
                  boxShadow: '0 12px 24px -18px rgba(17,24,39,0.25)',
                }}
              >
                {manageUser?.name ? manageUser.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {manageUser?.name || '관리자'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  System Admin
                </Typography>
              </Box>
            </Box>
            <AdminLogoutButton onClick={onLogout} />
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: { xs: 4, lg: 6 }, width: '100%' }}>{children}</Box>
    </Box>
  </Box>
);

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  manageUser: PropTypes.shape({
    name: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
  customMenu: PropTypes.node,
};

AdminLayout.defaultProps = {
  manageUser: null,
  customMenu: null,
};

export default AdminLayout;

const AdminLogoutWrapper = styled.div`
  .admin-logout-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 4px 12px rgba(15, 23, 42, 0.18);
    background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
  }

  .admin-logout-icon {
    width: 100%;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-logout-icon svg {
    width: 18px;
  }

  .admin-logout-icon svg path {
    fill: #ffffff;
  }

  .admin-logout-text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: #ffffff;
    font-size: 1.05em;
    font-weight: 600;
    transition-duration: 0.3s;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .admin-logout-btn:hover {
    width: 140px;
    border-radius: 44px;
    transition-duration: 0.3s;
    box-shadow: 4px 6px 18px rgba(15, 23, 42, 0.28);
  }

  .admin-logout-btn:hover .admin-logout-icon {
    width: 28%;
    padding-left: 20px;
  }

  .admin-logout-btn:hover .admin-logout-text {
    opacity: 1;
    width: 72%;
    padding-right: 12px;
  }

  .admin-logout-btn:active {
    transform: translate(1px, 1px);
  }
`;

const AdminLogoutButton = ({ onClick }) => (
  <AdminLogoutWrapper>
    <button type="button" className="admin-logout-btn" onClick={onClick} aria-label="관리자 로그아웃">
      <div className="admin-logout-icon">
        <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
          <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
        </svg>
      </div>
      <div className="admin-logout-text">Logout</div>
    </button>
  </AdminLogoutWrapper>
);

AdminLogoutButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

