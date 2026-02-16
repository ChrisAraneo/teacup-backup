import { FtpConfig } from './ftp-config.interface';
import { LogLevel } from './log-level.type';

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
