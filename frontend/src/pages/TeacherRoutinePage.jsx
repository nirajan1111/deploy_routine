import React, { useRef, useState } from 'react';
import { Navigate, Link } from 'react-router';
import RoutineTable from '../components/routine/RoutineTable';
import {
    Box, Typography, Alert, Container,
    Paper, Button,
    Menu,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TeacherRoutinePage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const routineRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);

    // Handle not logged in case
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Handle non-teacher users
    if (!user.is_teacher && !user.is_superuser) {
        return (
            <Box sx={{ m: 4 }}>
                <Alert severity="error">
                    You don't have permission to view this page. Only teachers can view their routines.
                </Alert>
            </Box>
        );
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const downloadAsImage = async () => {
        if (routineRef.current) {
            try {
                const canvas = await html2canvas(routineRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff'
                });
                const image = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = image;
                link.download = `routine_${user.email.split('@')[0]}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        }
        handleClose();
    };

    const downloadAsPDF = async () => {
        if (routineRef.current) {
            try {
                const canvas = await html2canvas(routineRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`routine_${user.email.split('@')[0]}.pdf`);
            } catch (error) {
                console.error('Error downloading PDF:', error);
            }
        }
        handleClose();
    };

    return (
        <Box
            sx={{
                maxWidth: '100%',
                height: 'calc(100vh - 64px)',
                overflow: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title="Download Routine">
                        <IconButton
                            onClick={handleClick}
                            color="primary"
                            aria-label="download routine"
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={downloadAsPDF}>
                        <PictureAsPdfIcon sx={{ mr: 1 }} />
                        Download as PDF
                    </MenuItem>
                    <MenuItem onClick={downloadAsImage}>
                        <ImageIcon sx={{ mr: 1 }} />
                        Download as Image
                    </MenuItem>
                </Menu>
            </Box>
            <Paper 
                ref={routineRef} 
                sx={{ 
                    p: 2,
                   
                }}
            >
                <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                    {user.name}'s Teaching Schedule
                </Typography>
                <RoutineTable teacherEmail={user.email} />
            </Paper>
        </Box>
    );
};

export default TeacherRoutinePage; 