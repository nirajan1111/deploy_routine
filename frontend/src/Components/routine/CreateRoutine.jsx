import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  Grid 
} from '@mui/material';
import { Link } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateRoutine = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={Link}
            to="/routines"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Create New Routine
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          {/* Routine creation form will go here */}
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateRoutine; 