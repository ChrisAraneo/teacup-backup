import type { Subject } from 'rxjs';
import { match } from 'ts-pattern';
import type { Task } from '../../types/task';
import type { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { writeSuccessfulTask } from './write-successful-task';

export const writeTask = (
  subject: Subject<Task>,
  id: TaskId,
  status: TaskStatus,
  message: string,
  dependsOn?: TaskId,
): void =>
  match(status)
    .with(TaskStatus.Success, () =>
      writeSuccessfulTask(subject, { id, status, message, dependsOn }),
    )
    .otherwise(() => subject.error({ id, status, message }));
