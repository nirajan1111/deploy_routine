import React, { useRef, useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Fade
} from '@mui/material';
import { Link, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RoutineTable from './RoutineTable';
import BACKEND_URL from './../../config';

const ViewRoutine = () => {
  const { type, id } = useParams();
  const routineRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);


  useEffect(() => {
    if (type === 'group') {
      const storedGroup = localStorage.getItem('group');
      if (storedGroup) {
        setGroupInfo(JSON.parse(storedGroup));
      }
    }else{
      const storedRoom =localStorage.getItem('room')
      if(storedRoom){
        setRoomInfo(JSON.parse(storedRoom))
      }
    }
  }, [type]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const downloadAsImage = async () => {
    if (routineRef.current) {
      try {
        setIsLoading(true);
        const canvas = await html2canvas(routineRef.current, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff'
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `routine_${type}_${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading image:', error);
      } finally {
        setIsLoading(false);
        handleClose();
      }
    }
  };

  const downloadAsPDF = async () => {
    if (routineRef.current) {
      try {
        setIsLoading(true);
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
        pdf.save(`routine_${type}_${id}.pdf`);
      } catch (error) {
        console.error('Error downloading PDF:', error);
      } finally {
        setIsLoading(false);
        handleClose();
      }
    }
  };

  const getTitle = () => {
    if (type === 'rooms') return `Room ${roomInfo?.room_code} Schedule`;
    if (type === 'group' && groupInfo) {
      return `${groupInfo?.name} (${groupInfo?.year_enrolled}) Schedule`;
    }
    return 'View Routine';
  };

  return (
    <Fade in={true} timeout={600}>
      <Container maxWidth="lg">
        <Box sx={{ 
          mt: 4, 
          mb: 4,
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                <Link 
                  to="/"
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                  Home
                </Link>
                <Typography color="text.primary">{type}</Typography>
                <Typography color="text.primary">
                  {type === 'group' && groupInfo ? groupInfo.name : id}
                </Typography>
              </Breadcrumbs>
              
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 32 }} />
                {getTitle()}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Download Routine">
                <IconButton 
                  onClick={handleClick}
                  color="primary"
                  aria-label="download routine"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                  disabled={isLoading}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
              sx={{
                '& .MuiPaper-root': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  borderRadius: 2
                }
              }}
            >
              <MenuItem 
                onClick={downloadAsPDF}
                sx={{ 
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <PictureAsPdfIcon sx={{ mr: 1 }} />
                Download as PDF
              </MenuItem>
              <MenuItem 
                onClick={downloadAsImage}
                sx={{ 
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <ImageIcon sx={{ mr: 1 }} />
                Download as Image
              </MenuItem>
            </Menu>
          </Box>

          <Paper 
            ref={routineRef}
            elevation={2}
            sx={{ 
              p: 3,
              borderRadius: 3,
              backgroundColor: '#ffffff',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(17, 115, 152, 0.12)',
                transform: 'translateY(-4px)'
              }
            }}
          >
            {type === 'rooms' && <RoutineTable roomNo={id} year={2081} title={getTitle()}/>}
            {type === 'group' && <RoutineTable userGroup={id} year={2081} title={getTitle()}/>}
          </Paper>
        </Box>
      </Container>
    </Fade>
  );
};

export default ViewRoutine; 