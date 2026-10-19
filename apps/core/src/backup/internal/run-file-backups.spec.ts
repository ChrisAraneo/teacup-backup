import { Base64File } from '@chris.araneo/file-system';
import { mkdtempSync, readdirSync } from 'fs';
import { map, slice, sortBy } from 'lodash-es';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import {
  lastValueFrom,
  materialize,
  type Observable,
  of,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runFileBackups } from './run-file-backups';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const CONTENTS: Record<string, string> = {
  alpha: 'YWxwaGEgY29udGVudA==',
  beta: 'YmV0YSBjb250ZW50',
};

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

const SERVICES = {
  fileFinder: {
    findFiles: (pattern: string, roots: string[]) =>
      of([
        {
          success: true,
          pattern,
          root: roots[0],
          result: [`/root/${pattern}.txt`],
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
            new Base64File(
              path,
              CONTENTS[basename(path, '.txt')] ?? '',
              MODIFIED_DATE,
            ),
        ),
      ),
  },
  logger: { debug: () => 'ignored' },
} as unknown as TeacupBackupServices;

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runFileBackups', () => {
  it('should back up every pattern and then report the end when it gets two patterns', async () => {
    const backupDirectory = createTemporaryDirectory();
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runFileBackups(
        createConfig(['alpha', 'beta']),
        backupDirectory,
        subject,
        SERVICES,
      ).pipe(toArray()),
    );
    const events = await readTaskEvents(subject, 8);

    expect(values).toEqual([[null, null]]);
    expect(map(events, (event) => [event.kind, event.value?.id])).toEqual([
      ['N', 'FIND_FILES'],
      ['N', 'ENCRYPT_FILES'],
      ['N', 'FIND_FILES'],
      ['N', 'ENCRYPT_FILES'],
      ['N', 'WRITE_ENCRYPTED_FILES'],
      ['N', 'WRITE_ENCRYPTED_FILES'],
      ['N', 'FINALIZE'],
      ['C', undefined],
    ]);
    expect(
      sortBy(
        map(slice(events, 4, 6), (event) => event.value?.message),
        (message) => message,
      ),
    ).toEqual([
      'Wrote files: alpha_20240315896cf_txt',
      'Wrote files: beta_202403159e875_txt',
    ]);
    expect(readdirSync(backupDirectory)).toEqual([
      'alpha_20240315896cf_txt.mbe',
      'beta_202403159e875_txt.mbe',
    ]);
  });

  it('should report nothing and give no value when no pattern is configured', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runFileBackups(
        createConfig([]),
        createTemporaryDirectory(),
        subject,
        SERVICES,
      ).pipe(toArray()),
    );
    subject.complete();
    const events = await readTaskEvents(subject, 1);

    expect(values).toEqual([]);
    expect(events).toEqual([{ kind: 'C' }]);
  });
});
