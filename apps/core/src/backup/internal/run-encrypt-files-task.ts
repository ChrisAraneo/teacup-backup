import type { EncryptedFile } from '@chris.araneo/crypto';
import type { Base64File } from '@chris.araneo/file-system';
import { join, map } from 'lodash-es';
import { catchError, EMPTY, type Observable, type Subject, tap } from 'rxjs';
import { formatErrorText } from '../../format-error-text';
import { runEffect } from '../../run-effect';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { toEncryptedFiles } from './to-encrypted-files';
import { writeTask } from './write-task';

export const runEncryptFilesTask = (
  files: Base64File[],
  secret: string,
  subject: Subject<Task>,
): Observable<EncryptedFile[]> =>
  toEncryptedFiles(files, secret).pipe(
    tap((encryptedFiles) =>
      writeTask(
        subject,
        TaskId.EncryptFiles,
        TaskStatus.Success,
        `Encrypted files: ${join(
          map(encryptedFiles, (file) => file.getFilename()),
          ',',
        )}`,
        TaskId.FindFiles,
      ),
    ),
    catchError((error: unknown) =>
      runEffect(EMPTY, () =>
        writeTask(
          subject,
          TaskId.EncryptFiles,
          TaskStatus.Error,
          formatErrorText(error),
          TaskId.FindFiles,
        ),
      ),
    ),
  );
