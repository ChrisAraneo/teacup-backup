import { uploadDirectory } from '@chris.araneo/ftp';
import { catchError, map, type Observable, of, type Subject, tap } from 'rxjs';
import { runEffect } from '../../run-effect';
import type { FtpConfig } from '../../types/ftp-config';
import type { Task } from '../../types/task';
import { TaskId } from '../../types/task-id';
import { TaskStatus } from '../../types/task-status';
import { formatFtpErrorText } from './format-ftp-error-text';
import { writeTask } from './write-task';

export const writeFtpBackupDirectory = (
  { host, user, password, directory }: FtpConfig,
  backupDirectory: string,
  subject: Subject<Task>,
): Observable<string | null> =>
  uploadDirectory()({
    host,
    user,
    password,
    localPath: backupDirectory,
    remotePath: directory,
  }).pipe(
    map(() => backupDirectory),
    tap((uploadedDirectory) =>
      writeTask(
        subject,
        TaskId.UploadFtp,
        TaskStatus.Success,
        `Successfully uploaded directory: ${uploadedDirectory}`,
        TaskId.WriteEncryptedFiles,
      ),
    ),
    catchError((error: unknown) =>
      runEffect(of(null), () =>
        writeTask(
          subject,
          TaskId.UploadFtp,
          TaskStatus.Error,
          formatFtpErrorText(error),
          TaskId.WriteEncryptedFiles,
        ),
      ),
    ),
  );
