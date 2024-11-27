import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Page } from '../shared/models/page.js';

export const pageSlice = createSlice({
  name: 'page',
  initialState: {
    value: 'main-menu',
  },
  reducers: {
    setPage: (state, action: PayloadAction<Page>) => {
      state.value = action.payload;
    },
  },
});

export const { setPage } = pageSlice.actions;

export default pageSlice.reducer;
