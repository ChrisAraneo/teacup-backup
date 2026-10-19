import {
  catchError,
  EMPTY,
  mergeMap,
  type Observable,
  type Subject,
} from 'rxjs';
import { runEffect } from '../../run-effect';
import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { createUnknownTaskError } from './create-unknown-task-error';
import { readBase64Files } from './read-base64-files';
import { runEncryptFilesTask } from './run-encrypt-files-task';
import { runFindFilesTask } from './run-find-files-task';
import { runUploadFtpTask } from './run-upload-ftp-task';
import { runWriteEncryptedFilesTask } from './run-write-encrypted-files-task';

export const runFileBackup = (
  pattern: string,
  config: Config,
  backupDirectory: string,
  subject: Subject<Task>,
  services: TeacupBackupServices,
): Observable<string | null> =>
  runFindFilesTask(pattern, config.roots, subject, services).pipe(
    mergeMap((foundFiles) =>
      readBase64Files(foundFiles, services.base64FileReader).pipe(
        mergeMap((files) =>
          runEncryptFilesTask(files, config?.secret ?? '', subject),
        ),
        mergeMap((encryptedFiles) =>
          runWriteEncryptedFilesTask(encryptedFiles, backupDirectory, subject),
        ),
        mergeMap(() => runUploadFtpTask(config, subject, services)),
      ),
    ),
    catchError((error: unknown) =>
      runEffect(EMPTY, () => subject.error(createUnknownTaskError(error))),
    ),
  );
