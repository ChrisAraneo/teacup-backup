import type { CurrentDirectory } from '@chris.araneo/file-system';
import { normalize } from 'path';

export const toAbsoluteBackupDirectory = (
  backupDirectory: string,
  currentDirectory: CurrentDirectory,
): string =>
  normalize(`${currentDirectory.getCurrentDirectory()}/${backupDirectory}`);
