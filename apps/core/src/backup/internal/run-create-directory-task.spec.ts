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
import { runCreateDirectoryTask } from './run-create-directory-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runCreateDirectoryTask', () => {
  it('should report the ready folder when the folder was created', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runCreateDirectoryTask('/backup', Promise.resolve(), subject).pipe(
        toArray(),
      ),
    );
    const events = await readTaskEvents(subject, 1);

    expect(values).toEqual([undefined]);
    expect(events).toEqual([
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

  it('should fail the folder task and give no value when the folder could not be created', async () => {
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runCreateDirectoryTask(
        '/backup',
        Promise.reject("Can't create directory"),
        subject,
      ).pipe(toArray()),
    );
    const events = await readTaskEvents(subject, 1);

    expect(values).toEqual([]);
    expect(events).toEqual([
      {
        kind: 'E',
        error: {
          id: 'CREATE_DIRECTORY',
          status: 'ERROR',
          message: "Can't create directory",
        },
      },
    ]);
    expect(keys(events[0]?.error)).toEqual(['id', 'status', 'message']);
  });
});
