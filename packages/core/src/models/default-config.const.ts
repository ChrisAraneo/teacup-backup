import { Config } from './config.interface';

const defaultConfig: Config = {
  roots: ['C:\\', 'D:\\'],
  files: [],
  mode: 'backup',
  backupDirectory: './backup',
  interval: 60 * 60 * 1000,
  'log-level': 'debug',
  ftp: {
    enabled: false,
    host: '',
    user: '',
    password: '',
    directory: 'backup',
  },
};

export const DEFAULT_CONFIG = JSON.stringify(defaultConfig);
