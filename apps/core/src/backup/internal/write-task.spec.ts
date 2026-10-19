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
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { writeTask } from './write-task';

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

describe('writeTask', () => {
  it('should send the task with its dependency when the status is a success', async () => {
    const subject = new ReplaySubject<Task>();

    writeTask(
      subject,
      TaskId.FindFiles,
      TaskStatus.Success,
      'Found files: ',
      TaskId.CreateDirectory,
    );
    subject.complete();
    const events = await readTaskEvents(subject, 2);

    expect(events).toEqual([
      {
        kind: 'N',
        value: {
          id: 'FIND_FILES',
          status: 'SUCCESS',
          message: 'Found files: ',
          dependsOn: 'CREATE_DIRECTORY',
        },
      },
      { kind: 'C' },
    ]);
  });

  it('should keep an empty dependency field when the task has no dependency', async () => {
    const subject = new ReplaySubject<Task>();

    writeTask(subject, TaskId.Start, TaskStatus.Success, 'Starting backup');
    subject.complete();
    const events = await readTaskEvents(subject, 2);

    expect(keys(events[0]?.value)).toEqual([
      'id',
      'status',
      'message',
      'dependsOn',
    ]);
  });

  it('should finish the stream when the final task succeeds', async () => {
    const subject = new ReplaySubject<Task>();

    writeTask(
      subject,
      TaskId.Finalize,
      TaskStatus.Success,
      'Finished all tasks for all files',
    );
    const events = await readTaskEvents(subject, 2);

    expect(map(events, (event) => event.kind)).toEqual(['N', 'C']);
  });

  it('should fail the stream without the dependency when the status is an error', async () => {
    const subject = new ReplaySubject<Task>();

    writeTask(
      subject,
      TaskId.EncryptFiles,
      TaskStatus.Error,
      'Error: broken',
      TaskId.FindFiles,
    );
    const events = await readTaskEvents(subject, 1);

    expect(events).toEqual([
      {
        kind: 'E',
        error: {
          id: 'ENCRYPT_FILES',
          status: 'ERROR',
          message: 'Error: broken',
        },
      },
    ]);
    expect(keys(events[0]?.error)).toEqual(['id', 'status', 'message']);
  });

  it('should fail the stream when the status is in progress', async () => {
    const subject = new ReplaySubject<Task>();

    writeTask(subject, TaskId.UploadFtp, TaskStatus.InProgress, 'Uploading');
    const events = await readTaskEvents(subject, 1);

    expect(events).toEqual([
      {
        kind: 'E',
        error: {
          id: 'UPLOAD_FTP',
          status: 'IN_PROGRESS',
          message: 'Uploading',
        },
      },
    ]);
  });
});
