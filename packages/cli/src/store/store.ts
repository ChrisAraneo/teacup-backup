import { configureStore } from '@reduxjs/toolkit';

import cursorReducer from './cursor.slice.js';

const store = configureStore({
  reducer: {
    cursor: cursorReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
