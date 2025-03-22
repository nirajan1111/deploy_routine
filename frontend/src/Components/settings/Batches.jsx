import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box 
} from '@mui/material';

const Batches = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Batches
        </Typography>
        <Paper sx={{ p: 3 }}>
          {/* Batch management content */}
        </Paper>
      </Box>
    </Container>
  );
};

export default Batches; 