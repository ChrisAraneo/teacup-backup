import type { CurrentDirectory } from '@chris.araneo/file-system';
import { join } from 'path';

import { toAbsoluteBackupDirectory } from './to-absolute-backup-directory';

const WORK_DIRECTORY = join('/work', 'teacup');

const CURRENT_DIRECTORY = {
  getCurrentDirectory: () => WORK_DIRECTORY,
} as unknown as CurrentDirectory;

describe('toAbsoluteBackupDirectory', () => {
  it('should put the folder under the working folder when it gets a relative folder', () => {
    const directory = toAbsoluteBackupDirectory('backup', CURRENT_DIRECTORY);

    expect(directory).toBe(join('/work', 'teacup', 'backup'));
  });

  it('should drop the dot when the folder starts with a dot', () => {
    const directory = toAbsoluteBackupDirectory('./backup', CURRENT_DIRECTORY);

    expect(directory).toBe(join('/work', 'teacup', 'backup'));
  });

  it('should go one folder up when the folder starts with two dots', () => {
    const directory = toAbsoluteBackupDirectory('../backup', CURRENT_DIRECTORY);

    expect(directory).toBe(join('/work', 'backup'));
  });
});
