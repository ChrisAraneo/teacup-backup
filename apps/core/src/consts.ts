import type { Config } from './types/config';

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;

const DEFAULT_CONFIG_VALUES: Config = {
  roots: ['C:\\', 'D:\\'],
  files: [],
  mode: 'backup',
  backupDirectory: './backup',
  interval: DEFAULT_INTERVAL_MS,
  'log-level': 'debug',
  ftp: {
    enabled: false,
    host: '',
    user: '',
    password: '',
    directory: 'backup',
  },
};

export const DEFAULT_CONFIG = JSON.stringify(DEFAULT_CONFIG_VALUES);

export const CONFIG_FILENAME = 'config.json';

export const ENCRYPTED_FILE_EXTENSION = '.mbe';
