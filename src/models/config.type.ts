export type Config = {
  roots: string[];
  files: string[];
  mode: 'backup' | 'restore';
  backupDirectory: string;
  interval: number;
  'log-level': string;
  ftp?: FtpConfig;
};

export type FtpConfig = {
  enabled: boolean;
  host: string;
  user: string;
  password: string;
  directory: string;
};
