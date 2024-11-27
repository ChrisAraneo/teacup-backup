import { configureStore } from '@reduxjs/toolkit';

import cursorReducer from './cursor.slice.js';
import pageReducer from './page.slice.js';

const store = configureStore({
  reducer: {
    page: pageReducer,
    cursor: cursorReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
