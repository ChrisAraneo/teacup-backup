import { map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  Subscription,
  take,
  toArray,
} from 'rxjs';

import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { startBackupTasks } from './start-backup-tasks';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const CONFIG: Config = {
  roots: ['/root'],
  files: [],
  mode: 'backup',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
};

const SERVICES = {} as unknown as TeacupBackupServices;

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('startBackupTasks', () => {
  it('should report the start and then the ready folder when no pattern is configured', async () => {
    const subject = new ReplaySubject<Task>();

    const subscription = startBackupTasks(
      CONFIG,
      '/backup',
      Promise.resolve(),
      subject,
      SERVICES,
    );
    const events = await readTaskEvents(subject, 2);

    expect(subscription).toBeInstanceOf(Subscription);
    expect(events).toEqual([
      {
        kind: 'N',
        value: { id: 'START', status: 'SUCCESS', message: 'Starting backup' },
      },
      {
        kind: 'N',
        value: {
          id: 'CREATE_DIRECTORY',
          status: 'SUCCESS',
          message: 'Backup directory is ready: /backup',
          dependsOn: 'START',
        },
      },
    ]);
  });

  it('should report nothing yet when it has just started', () => {
    const subject = new ReplaySubject<Task>();
    const seen: Task[] = [];

    startBackupTasks(CONFIG, '/backup', Promise.resolve(), subject, SERVICES);
    subject.subscribe((task) => seen.push(task));

    expect(seen).toEqual([]);
  });
});
