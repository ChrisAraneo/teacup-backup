import {
  delay,
  mergeMap,
  of,
  type Subject,
  type Subscription,
  tap,
} from 'rxjs';
import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runCreateDirectoryTask } from './run-create-directory-task';
import { runFileBackups } from './run-file-backups';
import { writeTask } from './write-task';

const START_TASK_DELAY_MS = 20;

const CREATE_DIRECTORY_TASK_DELAY_MS = 20;

export const startBackupTasks = (
  config: Config,
  backupDirectory: string,
  createdDirectory: Promise<void>,
  subject: Subject<Task>,
  services: TeacupBackupServices,
): Subscription =>
  of([])
    .pipe(
      delay(START_TASK_DELAY_MS),
      tap(() =>
        writeTask(subject, TaskId.Start, TaskStatus.Success, 'Starting backup'),
      ),
      delay(CREATE_DIRECTORY_TASK_DELAY_MS),
      mergeMap(() =>
        runCreateDirectoryTask(backupDirectory, createdDirectory, subject).pipe(
          mergeMap(() =>
            runFileBackups(config, backupDirectory, subject, services),
          ),
        ),
      ),
    )
    .subscribe();
