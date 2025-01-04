import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Config, LogLevel } from '@teacup-backup/core';

export const cursorSlice = createSlice({
  name: 'config',
  initialState: {
    backupDirectory: '',
    files: [] as string[],
    interval: 3600,
    'log-level': 'info' as LogLevel,
    roots: ['C:\\', 'D:\\'],
    ftp: {
      enabled: false,
      directory: '',
      host: '',
      password: '',
      user: '',
    },
    mode: 'backup',
  } as Config,
  reducers: {
    setBackupDirectory: (state, action: PayloadAction<string>) => {
      state.backupDirectory = action.payload;
    },
    addFile: (state, action: PayloadAction<string>) => {
      state.files = [...state.files, action.payload];
    },
    updateFile: (
      state,
      action: PayloadAction<{ index: number; file: string }>,
    ) => {
      const files = [...state.files];
      files[action.payload.index] = action.payload.file;

      state.files = files;
    },
    setInterval: (state, action: PayloadAction<number>) => {
      state.interval = action.payload;
    },
    setLogLevel: (state, action: PayloadAction<LogLevel>) => {
      state['log-level'] = action.payload;
    },
    addRoot: (state, action: PayloadAction<string>) => {
      state.roots = [...state.roots, action.payload];
    },
    updateRoot: (
      state,
      action: PayloadAction<{ index: number; root: string }>,
    ) => {
      const roots = [...state.roots];
      roots[action.payload.index] = action.payload.root;

      state.roots = roots;
    },
    setMode: (state, action: PayloadAction<'backup' | 'restore'>) => {
      state.mode = action.payload;
    },
  },
});

export const {
  setBackupDirectory,
  addFile,
  updateFile,
  setInterval,
  setLogLevel,
  addRoot,
  updateRoot,
} = cursorSlice.actions;

export default cursorSlice.reducer;
