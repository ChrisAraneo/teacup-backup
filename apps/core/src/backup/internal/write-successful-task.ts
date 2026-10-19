import { noop } from 'lodash-es';
import type { Subject } from 'rxjs';
import { match } from 'ts-pattern';
import { runEffect } from '../../run-effect';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';

export const writeSuccessfulTask = (subject: Subject<Task>, task: Task): void =>
  match(runEffect(task, (value) => subject.next(value)))
    .with({ id: TaskId.Finalize }, () => subject.complete())
    .otherwise(noop);
