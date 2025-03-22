import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography 
} from '@mui/material';
import { Link } from 'react-router';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';
import { Schedule } from '@mui/icons-material';

const settingsItems = [
  {
    title: 'Rooms',
    icon: <MeetingRoomIcon />,
    path: '/routines/rooms'
  },
  {
    title: 'Group',
    icon: <GroupIcon />,
    path: '/'
  }
];

const RoutineView = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<Schedule sx={{ mr: 2 }} />}
      >
        View Routine
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {settingsItems.map((item) => (
          <MenuItem 
            key={item.title}
            component={Link}
            to={item.path}
            onClick={handleClose}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText>
              <Typography variant="inherit">{item.title}</Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default RoutineView; 