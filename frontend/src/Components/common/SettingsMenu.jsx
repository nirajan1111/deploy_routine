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
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';

const settingsItems = [
  {
    title: 'Department',
    icon: <SchoolIcon />,
    path: '/settings/departments'
  },
  {
    title: 'Courses',
    icon: <ClassIcon />,
    path: '/settings/courses'
  },
  {
    title: 'Rooms',
    icon: <MeetingRoomIcon />,
    path: '/settings/rooms'
  },
  {
    title: 'Batch',
    icon: <GroupIcon />,
    path: '/settings/batches'
  },
  {
    title: 'Sections',
    icon: <GroupIcon />,
    path: '/settings/sections'
  }
];

const SettingsMenu = () => {
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
        startIcon={<SettingsIcon />}
      >
        Settings
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

export default SettingsMenu; 