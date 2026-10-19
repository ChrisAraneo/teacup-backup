import { forkJoin, type Observable, type Subject, tap } from 'rxjs';
import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runFileBackup } from './run-file-backup';
import { writeTask } from './write-task';

export const runFileBackups = (
  config: Config,
  backupDirectory: string,
  subject: Subject<Task>,
  services: TeacupBackupServices,
): Observable<(string | null)[]> =>
  forkJoin(
    // eslint-disable-next-line no-restricted-syntax -- a config without a files array must still fail with a TypeError here
    config.files.map((pattern) =>
      runFileBackup(pattern, config, backupDirectory, subject, services),
    ),
  ).pipe(
    tap(() =>
      writeTask(
        subject,
        TaskId.Finalize,
        TaskStatus.Success,
        'Finished all tasks for all files',
      ),
    ),
  );
