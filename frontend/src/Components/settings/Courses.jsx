import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box 
} from '@mui/material';

const Courses = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Courses
        </Typography>
        <Paper sx={{ p: 3 }}>
          {/* Course management content */}
        </Paper>
      </Box>
    </Container>
  );
};

export default Courses; 