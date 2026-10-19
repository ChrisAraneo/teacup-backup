import { type Observable, of, type Subject } from 'rxjs';
import { match } from 'ts-pattern';
import { toAbsoluteBackupDirectory } from '../../to-absolute-backup-directory';
import type { Config } from '../../types/config';
import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { writeFtpBackupDirectory } from './write-ftp-backup-directory';

export const runUploadFtpTask = (
  config: Config,
  subject: Subject<Task>,
  services: TeacupBackupServices,
): Observable<string | null> =>
  match(Boolean(config.ftp?.enabled))
    .with(true, () =>
      writeFtpBackupDirectory(
        config.ftp,
        toAbsoluteBackupDirectory(
          config.backupDirectory,
          services.currentDirectory,
        ),
        subject,
      ),
    )
    .otherwise(() => of(null));
