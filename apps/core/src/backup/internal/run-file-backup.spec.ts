import { Base64File } from '@chris.araneo/file-system';
import { mkdtempSync, readdirSync } from 'fs';
import { map } from 'lodash-es';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  lastValueFrom,
  materialize,
  type Observable,
  of,
  ReplaySubject,
  take,
  throwError,
  toArray,
} from 'rxjs';

import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runFileBackup } from './run-file-backup';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const CONFIG: Config = {
  roots: ['/root'],
  files: ['alpha'],
  mode: 'backup',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
  secret: 'secret',
};

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createServices = (
  readFiles: (paths: string[]) => Observable<Base64File[]>,
): TeacupBackupServices =>
  ({
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
    base64FileReader: { readFiles },
    logger: { debug: () => 'ignored' },
  }) as unknown as TeacupBackupServices;

const readAlphaFiles = (paths: string[]): Observable<Base64File[]> =>
  of(
    map(
      paths,
      (path) => new Base64File(path, 'YWxwaGEgY29udGVudA==', MODIFIED_DATE),
    ),
  );

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runFileBackup', () => {
  it('should find, encrypt and write the files when the pattern matches', async () => {
    const backupDirectory = createTemporaryDirectory();
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runFileBackup(
        'alpha',
        CONFIG,
        backupDirectory,
        subject,
        createServices(readAlphaFiles),
      ).pipe(toArray()),
    );
    const events = await readTaskEvents(subject, 3);

    expect(values).toEqual([null]);
    expect(map(events, (event) => event.value?.id)).toEqual([
      'FIND_FILES',
      'ENCRYPT_FILES',
      'WRITE_ENCRYPTED_FILES',
    ]);
    expect(readdirSync(backupDirectory)).toEqual([
      'alpha_20240315896cf_txt.mbe',
    ]);
  });

  it('should fail the stream with an unknown task error when reading the files fails', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runFileBackup(
        'alpha',
        CONFIG,
        createTemporaryDirectory(),
        subject,
        createServices(() => throwError(() => new Error('broken'))),
      ).pipe(toArray()),
    );
    const events = await readTaskEvents(subject, 2);

    expect(values).toEqual([]);
    expect(events).toEqual([
      {
        kind: 'N',
        value: {
          id: 'FIND_FILES',
          status: 'SUCCESS',
          message: 'Found files: /root/alpha.txt',
          dependsOn: 'CREATE_DIRECTORY',
        },
      },
      {
        kind: 'E',
        error: { task: 'UNKNOWN', message: 'Error: broken', status: 'error' },
      },
    ]);
  });
});
