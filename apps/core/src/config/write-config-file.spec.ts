import type { TextFile } from '@chris.araneo/file-system';
import { lastValueFrom, of, toArray } from 'rxjs';

import { runEffect } from '../run-effect';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { writeConfigFile } from './write-config-file';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const createServices = (writtenFiles: TextFile[]): TeacupBackupServices =>
  ({
    currentDirectory: {
      getExtendedInfo: () => ({ root: '/app' }),
      getCurrentDirectory: () => '/work',
    },
    textFileWriter: {
      writeFile: (file: TextFile) =>
        of(runEffect(undefined, () => writtenFiles.push(file))),
    },
  }) as unknown as TeacupBackupServices;

describe('writeConfigFile', () => {
  it('should write the text to the config file when it gets a text', async () => {
    const writtenFiles: TextFile[] = [];

    const events = await lastValueFrom(
      writeConfigFile(
        'plain text',
        createServices(writtenFiles),
        () => MODIFIED_DATE,
      ).pipe(toArray()),
    );

    expect(events).toEqual([undefined]);
    expect(writtenFiles[0]?.getPath()).toBe('/app/config.json');
    expect(writtenFiles[0]?.getContent()).toBe('plain text');
    expect(writtenFiles[0]?.getModifiedDate()).toBe(MODIFIED_DATE);
  });

  it('should write compact JSON when it gets a config', async () => {
    const writtenFiles: TextFile[] = [];

    await lastValueFrom(
      writeConfigFile(
        {
          roots: [],
          files: [],
          mode: 'restore',
          backupDirectory: 'backup',
          interval: 1,
          'log-level': 'error',
          ftp: {
            enabled: false,
            host: '',
            user: '',
            password: '',
            directory: '',
          },
        },
        createServices(writtenFiles),
        () => MODIFIED_DATE,
      ),
    );

    expect(writtenFiles[0]?.getContent()).toBe(
      '{"roots":[],"files":[],"mode":"restore","backupDirectory":"backup","interval":1,"log-level":"error","ftp":{"enabled":false,"host":"","user":"","password":"","directory":""}}',
    );
  });
});
