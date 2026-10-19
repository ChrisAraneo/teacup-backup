import type { EncryptedFile } from '@chris.araneo/crypto';
import { join, map } from 'lodash-es';
import { catchError, EMPTY, type Observable, type Subject, tap } from 'rxjs';
import { formatErrorText } from '../../format-error-text';
import { runEffect } from '../../run-effect';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { writeEncryptedFiles } from './write-encrypted-files';
import { writeTask } from './write-task';

export const runWriteEncryptedFilesTask = (
  files: EncryptedFile[],
  backupDirectory: string,
  subject: Subject<Task>,
): Observable<EncryptedFile[]> =>
  writeEncryptedFiles(files, backupDirectory).pipe(
    tap((writtenFiles) =>
      writeTask(
        subject,
        TaskId.WriteEncryptedFiles,
        TaskStatus.Success,
        `Wrote files: ${join(
          map(writtenFiles, (file) => file.getFilename()),
          ',',
        )}`,
        TaskId.EncryptFiles,
      ),
    ),
    catchError((error: unknown) =>
      runEffect(EMPTY, () =>
        writeTask(
          subject,
          TaskId.WriteEncryptedFiles,
          TaskStatus.Error,
          formatErrorText(error),
          TaskId.EncryptFiles,
        ),
      ),
    ),
  );
