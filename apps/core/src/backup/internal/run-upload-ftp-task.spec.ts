import { map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runUploadFtpTask } from './run-upload-ftp-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const FTP_TEST_TIMEOUT_MS = 20_000;

const SERVICES = {
  currentDirectory: { getCurrentDirectory: () => '/work' },
} as unknown as TeacupBackupServices;

const createConfig = (enabled: boolean): Config => ({
  roots: [],
  files: [],
  mode: 'backup',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: {
    enabled,
    host: '127.0.0.1',
    user: 'user',
    password: 'password',
    directory: 'remote',
  },
});

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runUploadFtpTask', () => {
  it('should give null and report nothing when the upload is turned off', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runUploadFtpTask(createConfig(false), subject, SERVICES).pipe(toArray()),
    );
    subject.complete();
    const events = await readTaskEvents(subject, 1);

    expect(values).toEqual([null]);
    expect(events).toEqual([{ kind: 'C' }]);
  });

  it('should give null and report nothing when the config has no FTP section', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runUploadFtpTask(
        { ...createConfig(false), ftp: undefined } as unknown as Config,
        subject,
        SERVICES,
      ).pipe(toArray()),
    );

    expect(values).toEqual([null]);
  });

  it(
    'should try the upload and report the failure when the upload is turned on and the server refuses',
    async () => {
      const subject = new ReplaySubject<Task>();

      const values = await lastValueFrom(
        runUploadFtpTask(createConfig(true), subject, SERVICES).pipe(toArray()),
      );
      const events = await readTaskEvents(subject, 1);

      expect(values).toEqual([null]);
      expect(events).toMatchObject([
        { kind: 'E', error: { id: 'UPLOAD_FTP', status: 'ERROR' } },
      ]);
    },
    FTP_TEST_TIMEOUT_MS,
  );
});
