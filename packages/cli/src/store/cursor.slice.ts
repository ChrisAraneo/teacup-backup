import { createSlice } from '@reduxjs/toolkit';

export const cursorSlice = createSlice({
  name: 'cursor',
  initialState: {
    value: 0,
    last: 0,
  },
  reducers: {
    moveUp: (state) => {
      if (state.value > 0) {
        state.value -= 1;
      } else {
        state.value = state.last;
      }
    },
    moveDown: (state) => {
      if (state.value < state.last) {
        state.value += 1;
      } else {
        state.value = 0;
      }
    },
    setMax: (state, action) => {
      state.last = action.payload;
    },
  },
});

export const { moveUp, moveDown, setMax } = cursorSlice.actions;

export default cursorSlice.reducer;
