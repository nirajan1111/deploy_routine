import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { routineApi } from '../services/api';

export const fetchSchedules = createAsyncThunk(
  'routine/fetchSchedules',
  async () => {
    const response = await routineApi.getSchedules();
    return response.data;
  }
);

export const optimizeRoutine = createAsyncThunk(
  'routine/optimize',
  async (params) => {
    const response = await routineApi.optimizeRoutine(params);
    return response.data;
  }
);

const routineSlice = createSlice({
  name: 'routine',
  initialState: {
    schedules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default routineSlice.reducer; 