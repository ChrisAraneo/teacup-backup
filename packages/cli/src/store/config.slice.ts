import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Config, LogLevel } from '@teacup-backup/core';

export const cursorSlice = createSlice({
  name: 'config',
  initialState: {
    backupDirectory: './backup',
    files: ['index.ts'] as string[],
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
    secret: '',
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
    setFtpEnabled: (state, action: PayloadAction<boolean>) => {
      state.ftp = {
        ...state.ftp,
        enabled: !!action.payload,
      };
    },
    setFtpDirectory: (state, action: PayloadAction<string>) => {
      state.ftp = {
        ...state.ftp,
        directory: action.payload,
      };
    },
    setFtpHost: (state, action: PayloadAction<string>) => {
      state.ftp = {
        ...state.ftp,
        host: action.payload,
      };
    },
    setFtpPassword: (state, action: PayloadAction<string>) => {
      state.ftp = {
        ...state.ftp,
        password: action.payload,
      };
    },
    setFtpUser: (state, action: PayloadAction<string>) => {
      state.ftp = {
        ...state.ftp,
        user: action.payload,
      };
    },
    setMode: (state, action: PayloadAction<'backup' | 'restore'>) => {
      state.mode = action.payload;
    },
    setSecret: (state, action: PayloadAction<string>) => {
      state.secret = action.payload;
    },
    readConfig: () => {
      return;
    },
    setConfig: (state, action: PayloadAction<Config>) => {
      state.backupDirectory = action.payload.backupDirectory;
      state.files = action.payload.files;
      state.ftp = action.payload.ftp;
      state.interval = action.payload.interval;
      state['log-level'] = action.payload['log-level'];
      state.mode = action.payload.mode;
      state.roots = action.payload.roots;
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
  setFtpEnabled,
  setFtpDirectory,
  setFtpUser,
  setFtpPassword,
  setFtpHost,
  setSecret,
  readConfig,
  setConfig,
} = cursorSlice.actions;

export default cursorSlice.reducer;
