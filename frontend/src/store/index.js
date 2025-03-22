import { configureStore } from '@reduxjs/toolkit';
import routineReducer from './routineSlice';

const store = configureStore({
  reducer: {
    routine: routineReducer,
  },
});

export default store; 