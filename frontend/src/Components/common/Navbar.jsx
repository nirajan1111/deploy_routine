import React from 'react';
import { useNavigate, Link } from 'react-router';
import {
    AppBar,
    Toolbar,
    Button,
    Typography,
    Box,
    Container,
    IconButton,
    Avatar,
    Chip,
    Tooltip,
} from '@mui/material';
import { ExitToApp, Schedule } from '@mui/icons-material';
import SettingsMenu from './SettingsMenu';
import RoutineView from './RoutineView';
import api from '../../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            

            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');

            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <AppBar 
            position="static" 
            color="primary" 
            elevation={0}
            sx={{
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar sx={{ px: { xs: 0 }, minHeight: '70px' }}>
                    <Schedule sx={{ 
                        mr: 2,
                        fontSize: '28px',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                    }} />
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
                        MSc Routine Management System
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <RoutineView />
                    </Box>

                    {user ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            '& > *': { transition: 'all 0.2s ease' }
                        }}>
                            <Chip
                                label="Admin Page"
                                color="secondary"
                                size="small"
                                sx={{ 
                                    mr: 1, 
                                    display: user?.is_superuser ? 'inline-flex' : 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }
                                }}
                                onClick={() => window.open('http://localhost:8000/admin/routine', '_self')}
                                title="Admin Page"
                            />
                            
                            {(user?.is_teacher || user?.is_superuser) && (
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/my-routine"
                                    sx={{
                                        borderRadius: '20px',
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.15)'
                                        }
                                    }}
                                >
                                    My Schedule
                                </Button>
                            )}

                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mr: 2,
                                    fontWeight: 500
                                }}
                            >
                                {user.name || user.email}
                            </Typography>

                            <Tooltip title="Logout">
                                <IconButton
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ 
                                        ml: 1,
                                        transition: 'transform 0.2s',
                                        '&:hover': { 
                                            transform: 'rotate(90deg)',
                                            backgroundColor: 'rgba(255,255,255,0.15)'
                                        }
                                    }}
                                >
                                    <ExitToApp />
                                </IconButton>
                            </Tooltip>

                            <Avatar
                                sx={{
                                    bgcolor: 'secondary.main',
                                    width: 38,
                                    height: 38,
                                    fontWeight: 600,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        cursor: 'pointer'
                                    }
                                }}
                            >
                                {user.name?.[0]?.toUpperCase()}
                            </Avatar>
                        </Box>
                    ) : (
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            variant="outlined"
                            sx={{
                                borderRadius: '20px',
                                px: 3,
                                borderWidth: '2px',
                                '&:hover': {
                                    borderWidth: '2px',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;