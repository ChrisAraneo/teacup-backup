import { createSlice } from '@reduxjs/toolkit';

export const clockSlice = createSlice({
  name: 'clock',
  initialState: {
    tick: 0,
  },
  reducers: {
    start: (state) => {
      state.tick = 0;
    },
    increment: (state) => {
      state.tick = state.tick + 1;
    },
  },
});

export const { start, increment } = clockSlice.actions;

export default clockSlice.reducer;
