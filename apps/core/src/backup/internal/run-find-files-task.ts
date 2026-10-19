import { join } from 'lodash-es';
import { type Observable, type Subject, tap } from 'rxjs';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { readMatchingFilePaths } from './read-matching-file-paths';
import { writeTask } from './write-task';

export const runFindFilesTask = (
  pattern: string,
  roots: string[],
  subject: Subject<Task>,
  services: TeacupBackupServices,
): Observable<string[]> =>
  readMatchingFilePaths(pattern, roots, services).pipe(
    tap((foundFiles) =>
      writeTask(
        subject,
        TaskId.FindFiles,
        TaskStatus.Success,
        `Found files: ${join(foundFiles, ', ')}`,
        TaskId.CreateDirectory,
      ),
    ),
  );
