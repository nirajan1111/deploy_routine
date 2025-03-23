import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import RoutineTable from '../Components/routine/RoutineTable';
import NaturalLanguageQuery from '../Components/routine/NaturalLanguageQuery';
import RoutineOptimizer from '../Components/routine/RoutineOptimizer';

const RoutineManagement = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Class Routine Management
        </Typography>
        
        <RoutineOptimizer />
        <NaturalLanguageQuery />
        <RoutineTable />
      </Box>
    </Container>
  );
};

export default RoutineManagement; 