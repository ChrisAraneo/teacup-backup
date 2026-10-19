import { Base64File } from '@chris.araneo/file-system';
import { mkdirSync, mkdtempSync, readdirSync } from 'fs';
import { map } from 'lodash-es';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  lastValueFrom,
  materialize,
  type Observable,
  of,
  Subject,
  take,
  toArray,
} from 'rxjs';

import { chain } from '../chain';
import { runEffect } from '../run-effect';
import type { Config } from '../types/config';
import type { Task } from '../types/task';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { runBackup } from './run-backup';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const createConfig = (files: string[]): Config => ({
  roots: ['/root'],
  files,
  mode: 'backup',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
  secret: 'secret',
});

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createDirectory = (
  directory: string,
  createdDirectories: string[],
): Promise<void> =>
  chain(directory)
    .thru((value) => runEffect(value, () => createdDirectories.push(value)))
    .thru((value) =>
      runEffect(value, () => mkdirSync(value, { recursive: true })),
    )
    .thru(() => Promise.resolve())
    .value();

const createServices = (
  workDirectory: string,
  createdDirectories: string[],
): TeacupBackupServices =>
  ({
    currentDirectory: { getCurrentDirectory: () => workDirectory },
    directoryCreator: {
      createIfDoesntExist: (directory: string) =>
        createDirectory(directory, createdDirectories),
    },
    fileFinder: {
      findFiles: (pattern: string, roots: string[]) =>
        of([
          {
            success: true,
            pattern,
            root: roots[0],
            result: ['/root/alpha.txt'],
            message: null,
          },
        ]),
    },
    base64FileReader: {
      readFiles: (paths: string[]) =>
        of(
          map(
            paths,
            (path) =>
              new Base64File(path, 'YWxwaGEgY29udGVudA==', MODIFIED_DATE),
          ),
        ),
    },
    logger: { debug: () => 'ignored' },
  }) as unknown as TeacupBackupServices;

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runBackup', () => {
  it('should create the backup folder at once when it is called', () => {
    const workDirectory = createTemporaryDirectory();
    const createdDirectories: string[] = [];

    const tasks = runBackup(
      createConfig([]),
      createServices(workDirectory, createdDirectories),
    );

    expect(createdDirectories).toEqual([join(workDirectory, 'backup')]);
    expect(tasks).not.toBeInstanceOf(Subject);
  });

  it('should report every task and then finish when the pattern matches a file', async () => {
    const workDirectory = createTemporaryDirectory();

    const events = await readTaskEvents(
      runBackup(createConfig(['alpha']), createServices(workDirectory, [])),
      7,
    );

    expect(map(events, (event) => [event.kind, event.value?.id])).toEqual([
      ['N', 'START'],
      ['N', 'CREATE_DIRECTORY'],
      ['N', 'FIND_FILES'],
      ['N', 'ENCRYPT_FILES'],
      ['N', 'WRITE_ENCRYPTED_FILES'],
      ['N', 'FINALIZE'],
      ['C', undefined],
    ]);
    expect(events[1]?.value?.message).toBe(
      `Backup directory is ready: ${join(workDirectory, 'backup')}`,
    );
    expect(readdirSync(join(workDirectory, 'backup'))).toEqual([
      'alpha_20240315896cf_txt.mbe',
    ]);
  });
});
