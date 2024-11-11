export interface Config {
  roots: string[];
  files: string[];
  mode: 'backup' | 'restore';
  backupDirectory: string;
  interval: number;
  'log-level': string;
  ftp?: FtpConfig;
}

export interface FtpConfig {
  enabled: boolean;
  host: string;
  user: string;
  password: string;
  directory: string;
}
