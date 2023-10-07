export type Config = {
  roots: string[];
  files: Array<{
    filename: string;
  }>;
  mode: "backup" | "restore";
  backupDirectory: string;
};