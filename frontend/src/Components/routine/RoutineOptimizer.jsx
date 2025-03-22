import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { optimizeRoutine } from '../../store/routineSlice';

const RoutineOptimizer = () => {
  const dispatch = useDispatch();
  const [optimizeParams, setOptimizeParams] = useState({
    year: 2,
    semester: 1,
    academic_year: '2023-2024',
  });

  const handleOptimize = () => {
    dispatch(optimizeRoutine(optimizeParams));
  };

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Optimize Routine
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={optimizeParams.year}
            onChange={(e) =>
              setOptimizeParams({
                ...optimizeParams,
                year: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Semester"
            type="number"
            value={optimizeParams.semester}
            onChange={(e) =>
              setOptimizeParams({
                ...optimizeParams,
                semester: parseInt(e.target.value),
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Academic Year"
            value={optimizeParams.academic_year}
            onChange={(e) =>
              setOptimizeParams({
                ...optimizeParams,
                academic_year: e.target.value,
              })
            }
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={handleOptimize}
      >
        Optimize Routine
      </Button>
    </Paper>
  );
};

export default RoutineOptimizer; 