import PropTypes from 'prop-types';
import {
  AppBar,
  Avatar,
  Box,
  Button,
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
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
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#ecfdf5' }}>
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(16,185,129,0.08)',
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
              background: '#0f766e',
              boxShadow: '0 16px 24px rgba(15, 118, 110, 0.28)',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#fff">
              HP
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
              HirePicker
            </Typography>
            <Typography variant="caption" color="#0f766e">
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
                    color: '#0f172a',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(13,148,136,0.12)',
                      color: '#0f766e',
                      '& .MuiListItemIcon-root': {
                        color: '#0f766e',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(13,148,136,0.08)',
                    },
                  }}
                  selected={item.href === '/hirepicker7338/admin'}
                >
                  <ListItemIcon sx={{ color: '#38bdf8', minWidth: 32 }}>
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
          backgroundColor: '#0f766e',
          color: '#ecfdf5',
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
        backgroundColor: '#f0fdfa',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: '#ecfdf5',
          color: '#0f172a',
          borderBottom: '1px solid rgba(13,148,136,0.12)',
          boxShadow: '0 10px 18px -12px rgba(14, 116, 144, 0.2)',
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
                  <SearchIcon sx={{ color: '#0f766e' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                color: '#0f172a',
                bgcolor: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(13,148,136,0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0f766e',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <IconButton sx={{ color: '#0f766e' }}>
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton sx={{ color: '#0f766e' }}>
              <SettingsOutlinedIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(148,163,184,0.35)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#0d9488',
                  color: '#fff',
                  fontWeight: 600,
                  boxShadow: '0 12px 24px -12px rgba(14, 116, 144, 0.4)',
                }}
              >
                {manageUser?.name ? manageUser.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {manageUser?.name || '관리자'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  System Admin
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                textTransform: 'none',
                px: 3,
                borderRadius: 2.5,
                backgroundColor: '#f87171',
                boxShadow: '0 14px 26px -18px rgba(248, 113, 113, 0.5)',
              }}
            >
              로그아웃
            </Button>
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

