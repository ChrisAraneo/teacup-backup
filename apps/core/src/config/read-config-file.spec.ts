import type { JsonFile } from '@chris.araneo/file-system';
import { lastValueFrom, of } from 'rxjs';

import { runEffect } from '../run-effect';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { readConfigFile } from './read-config-file';

const CONFIG_FILE = { content: { mode: 'restore' } } as unknown as JsonFile;

const createServices = (readPaths: string[]): TeacupBackupServices =>
  ({
    currentDirectory: {
      getExtendedInfo: () => ({ root: '/app' }),
      getCurrentDirectory: () => '/work',
    },
    jsonFileReader: {
      readFile: (path: string) =>
        of(runEffect(CONFIG_FILE, () => readPaths.push(path))),
    },
  }) as unknown as TeacupBackupServices;

describe('readConfigFile', () => {
  it('should read the config file from the application root when it is called', async () => {
    const readPaths: string[] = [];

    const file = await lastValueFrom(readConfigFile(createServices(readPaths)));

    expect(file).toBe(CONFIG_FILE);
    expect(readPaths).toEqual(['/app/config.json']);
  });
});
