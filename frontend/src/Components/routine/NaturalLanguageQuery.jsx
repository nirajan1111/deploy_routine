import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { routineApi } from '../../services/api';

const NaturalLanguageQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    try {
      setLoading(true);
      const response = await routineApi.queryRoutine(query);
      setResults(response.data);
    } catch (error) {
      console.error('Error querying routine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Natural Language Query
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show classes for Year 2 on Monday"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleQuery}
            disabled={loading}
          >
            Search
          </Button>
        </Box>
        {results.length > 0 && (
          <List>
            {results.map((result, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${result.subject.name} - ${result.teacher.name}`}
                  secondary={`${result.room.name} - ${result.time_slot.day} ${result.time_slot.start_time}-${result.time_slot.end_time}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NaturalLanguageQuery; 