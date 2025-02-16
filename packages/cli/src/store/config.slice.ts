import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Config, DEFAULT_CONFIG, LogLevel } from '@teacup-backup/core';

export const cursorSlice = createSlice({
  name: 'config',
  initialState: {
    loaded: false,
    data: {
      ...JSON.parse(DEFAULT_CONFIG),
      secret: '',
    } as Config,
  },
  reducers: {
    setBackupDirectory: (state, action: PayloadAction<string>) => {
      state.data.backupDirectory = action.payload;
    },
    addFile: (state, action: PayloadAction<string>) => {
      state.data.files = [...state.data.files, action.payload];
    },
    updateFile: (
      state,
      action: PayloadAction<{ index: number; file: string }>,
    ) => {
      const files = [...state.data.files];
      files[action.payload.index] = action.payload.file;

      state.data.files = files;
    },
    setInterval: (state, action: PayloadAction<number>) => {
      state.data.interval = action.payload;
    },
    setLogLevel: (state, action: PayloadAction<LogLevel>) => {
      state.data['log-level'] = action.payload;
    },
    addRoot: (state, action: PayloadAction<string>) => {
      state.data.roots = [...state.data.roots, action.payload];
    },
    updateRoot: (
      state,
      action: PayloadAction<{ index: number; root: string }>,
    ) => {
      const roots = [...state.data.roots];
      roots[action.payload.index] = action.payload.root;

      state.data.roots = roots;
    },
    setFtpEnabled: (state, action: PayloadAction<boolean>) => {
      state.data.ftp = {
        ...state.data.ftp,
        enabled: !!action.payload,
      };
    },
    setFtpDirectory: (state, action: PayloadAction<string>) => {
      state.data.ftp = {
        ...state.data.ftp,
        directory: action.payload,
      };
    },
    setFtpHost: (state, action: PayloadAction<string>) => {
      state.data.ftp = {
        ...state.data.ftp,
        host: action.payload,
      };
    },
    setFtpPassword: (state, action: PayloadAction<string>) => {
      state.data.ftp = {
        ...state.data.ftp,
        password: action.payload,
      };
    },
    setFtpUser: (state, action: PayloadAction<string>) => {
      state.data.ftp = {
        ...state.data.ftp,
        user: action.payload,
      };
    },
    setMode: (state, action: PayloadAction<'backup' | 'restore'>) => {
      state.data.mode = action.payload;
    },
    setSecret: (state, action: PayloadAction<string>) => {
      state.data.secret = action.payload;
    },
    readConfig: () => {
      return;
    },
    loadConfig: (state, action: PayloadAction<Config>) => {
      state.data.backupDirectory = action.payload.backupDirectory;
      state.data.files = action.payload.files;
      state.data.ftp = action.payload.ftp;
      state.data.interval = action.payload.interval;
      state.data['log-level'] = action.payload['log-level'];
      state.data.mode = action.payload.mode;
      state.data.roots = action.payload.roots;
      state.loaded = true;
    },
    noop: () => {
      return;
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
  loadConfig,
  noop,
} = cursorSlice.actions;

export default cursorSlice.reducer;
