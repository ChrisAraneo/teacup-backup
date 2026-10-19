import { lastValueFrom, type Observable, of, toArray } from 'rxjs';

import { DEFAULT_CONFIG } from '../consts';
import { runEffect } from '../run-effect';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { writeMissingConfigFile } from './write-missing-config-file';

const createServices = (
  contents: string[],
  readDirectories: string[],
): TeacupBackupServices =>
  ({
    currentDirectory: {
      getExtendedInfo: () => ({ root: '/app' }),
      getCurrentDirectory: () => '/work',
    },
    fileSystem: {
      readdir: (
        directory: string,
        callback: (error: null, files: string[]) => void,
      ) =>
        callback(
          null,
          runEffect(contents, () => readDirectories.push(directory)),
        ),
    },
  }) as unknown as TeacupBackupServices;

const createWriteConfig =
  (writtenConfigs: string[]): ((config: string) => Observable<void>) =>
  (config) =>
    of(runEffect(undefined, () => writtenConfigs.push(config)));

describe('writeMissingConfigFile', () => {
  it('should write the default config when the root holds no config file', async () => {
    const readDirectories: string[] = [];
    const writtenConfigs: string[] = [];

    const events = await lastValueFrom(
      writeMissingConfigFile(
        createServices(['notes.txt'], readDirectories),
        createWriteConfig(writtenConfigs),
      ).pipe(toArray()),
    );

    expect(events).toEqual([undefined]);
    expect(writtenConfigs).toEqual([DEFAULT_CONFIG]);
    expect(readDirectories).toEqual(['/app']);
  });

  it('should write nothing when the root holds a config file', async () => {
    const writtenConfigs: string[] = [];

    const events = await lastValueFrom(
      writeMissingConfigFile(
        createServices(['config.json', 'notes.txt'], []),
        createWriteConfig(writtenConfigs),
      ).pipe(toArray()),
    );

    expect(events).toEqual([undefined]);
    expect(writtenConfigs).toEqual([]);
  });
});
