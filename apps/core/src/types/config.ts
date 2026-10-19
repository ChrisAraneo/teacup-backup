import type { FtpConfig } from './ftp-config';
import type { LogLevel } from './log-level';

export interface Config {
  roots: string[];
  files: string[];
  mode: 'backup' | 'restore';
  backupDirectory: string;
  interval: number;
  'log-level': LogLevel;
  ftp: FtpConfig;
  secret?: string;
}
