import { configureStore } from '@reduxjs/toolkit';

import configReducer from './config.slice.js';
import cursorReducer from './cursor.slice.js';
import pageReducer from './page.slice.js';

const store = configureStore({
  reducer: {
    page: pageReducer,
    cursor: cursorReducer,
    config: configReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
