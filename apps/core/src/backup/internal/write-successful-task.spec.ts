import { map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { writeSuccessfulTask } from './write-successful-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const FIND_FILES_TASK: Task = {
  id: TaskId.FindFiles,
  status: TaskStatus.Success,
  message: 'Found files: /root/alpha.txt',
  dependsOn: TaskId.CreateDirectory,
};

const FINALIZE_TASK: Task = {
  id: TaskId.Finalize,
  status: TaskStatus.Success,
  message: 'Finished all tasks for all files',
  dependsOn: undefined,
};

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('writeSuccessfulTask', () => {
  it('should send the same task when it gets a task', async () => {
    const subject = new ReplaySubject<Task>();

    writeSuccessfulTask(subject, FIND_FILES_TASK);
    subject.complete();
    const events = await readTaskEvents(subject, 2);

    expect(events).toEqual([
      { kind: 'N', value: FIND_FILES_TASK },
      { kind: 'C' },
    ]);
    expect(events[0]?.value).toBe(FIND_FILES_TASK);
  });

  it('should send the task and then finish the stream when the task is the final task', async () => {
    const subject = new ReplaySubject<Task>();

    writeSuccessfulTask(subject, FINALIZE_TASK);
    const events = await readTaskEvents(subject, 2);

    expect(events).toEqual([
      { kind: 'N', value: FINALIZE_TASK },
      { kind: 'C' },
    ]);
  });
});
