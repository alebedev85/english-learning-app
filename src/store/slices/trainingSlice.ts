import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrainingState {
  totalSessionsCompleted: number;
}

const initialState: TrainingState = {
  totalSessionsCompleted: 0,
};

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    incrementCompletedSessions: (state) => {
      state.totalSessionsCompleted += 1;
    },
  },
});

export const { incrementCompletedSessions } = trainingSlice.actions;
export default trainingSlice.reducer;