import { LogLevel } from './log-level.type';

export interface Config {
  roots: string[];
  files: string[];
  mode: 'backup' | 'restore';
  backupDirectory: string;
  interval: number;
  'log-level': LogLevel;
  ftp?: FtpConfig;
}

export interface FtpConfig {
  enabled: boolean;
  host: string;
  user: string;
  password: string;
  directory: string;
}
