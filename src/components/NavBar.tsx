import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Star as StarIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const NavBar: React.FC = () => {
  const { user, profile, isAdmin, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          مكتبة الروابط الخاصة
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {isAdmin && (
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/admin')}
                >
                  لوحة التحكم
                </Button>
              )}

              <Button
                color="inherit"
                startIcon={<StarIcon />}
                onClick={() => navigate('/subscriptions')}
              >
                اشتراكاتي
              </Button>

              <IconButton
                onClick={handleMenuOpen}
                size="large"
                edge="end"
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  {user.email}
                </MenuItem>
                {profile?.role && (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      الدور: {profile.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                    </Typography>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => { navigate('/'); handleMenuClose(); }}>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  الصفحة الرئيسية
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  تسجيل الخروج
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={handleSignIn}
            >
              تسجيل الدخول مع Google
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};