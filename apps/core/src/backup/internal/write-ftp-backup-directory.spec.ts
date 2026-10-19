import { keys, map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Task } from '../../types/task';
import { writeFtpBackupDirectory } from './write-ftp-backup-directory';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const FTP_TEST_TIMEOUT_MS = 20_000;

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('writeFtpBackupDirectory', () => {
  it(
    'should fail the upload task and give null when the server refuses the connection',
    async () => {
      const subject = new ReplaySubject<Task>();

      const values = await lastValueFrom(
        writeFtpBackupDirectory(
          {
            enabled: true,
            host: '127.0.0.1',
            user: 'user',
            password: 'password',
            directory: 'remote',
          },
          '/backup',
          subject,
        ).pipe(toArray()),
      );
      const events = await readTaskEvents(subject, 1);

      expect(values).toEqual([null]);
      expect(events).toMatchObject([
        { kind: 'E', error: { id: 'UPLOAD_FTP', status: 'ERROR' } },
      ]);
      expect(keys(events[0]?.error)).toEqual(['id', 'status', 'message']);
      expect(events[0]?.error).toMatchObject({
        message: expect.stringContaining('ECONNREFUSED'),
      });
    },
    FTP_TEST_TIMEOUT_MS,
  );
});
