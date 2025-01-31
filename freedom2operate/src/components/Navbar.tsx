import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      console.error('Failed to log out');
    }
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Logo variant="h5" color="white" />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Navigation Links */}
          <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Home
              </Button>
              
              {!currentUser && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Register
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Login
                  </Button>
                </>
              )}

              <Button
                color="inherit"
                component={RouterLink}
                to="/expertise"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Expertise
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/contact"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Contact
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/about"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                About
              </Button>
          </>
          
          {/* User Menu */}
          {currentUser && (
            <>
              <Button
                color="inherit"
                onClick={handleMenu}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {currentUser.email}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  component={RouterLink}
                  to="/dashboard"
                  onClick={handleClose}
                >
                  Dashboard
                </MenuItem>
                {isAdmin && (
                  <>
                    <Divider />
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={handleClose}
                      sx={{ color: 'primary.main' }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  </>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
