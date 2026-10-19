import {
  catchError,
  EMPTY,
  first,
  from,
  type Observable,
  type Subject,
  tap,
} from 'rxjs';
import { formatErrorText } from '../../format-error-text';
import { runEffect } from '../../run-effect';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { writeTask } from './write-task';

export const runCreateDirectoryTask = (
  backupDirectory: string,
  createdDirectory: Promise<void>,
  subject: Subject<Task>,
): Observable<void> =>
  from(createdDirectory).pipe(
    first(),
    tap(() =>
      writeTask(
        subject,
        TaskId.CreateDirectory,
        TaskStatus.Success,
        `Backup directory is ready: ${backupDirectory}`,
        TaskId.Start,
      ),
    ),
    catchError((error: unknown) =>
      runEffect(EMPTY, () =>
        writeTask(
          subject,
          TaskId.CreateDirectory,
          TaskStatus.Error,
          formatErrorText(error),
          TaskId.Start,
        ),
      ),
    ),
  );
