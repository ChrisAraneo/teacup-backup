import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';

import { backupEpic } from './backup.epic.js';
import backupReducer from './backup.slice.js';
import { configEpic } from './config.epic.js';
import configReducer from './config.slice.js';
import cursorReducer from './cursor.slice.js';
import pageReducer from './page.slice.js';

const reducer = combineSlices({
  page: pageReducer,
  cursor: cursorReducer,
  config: configReducer,
  backup: backupReducer,
});

export type RootState = ReturnType<typeof reducer>;
export type AppEpic = Epic<unknown, unknown, RootState>;

const epicMiddleware = createEpicMiddleware<unknown, unknown, RootState>();

const rootEpic = combineEpics(backupEpic, configEpic);

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);

export type AppDispatch = typeof store.dispatch;

export default store;
