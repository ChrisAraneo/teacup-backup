import { type Observable, Subject } from 'rxjs';
import { chain } from '../chain';
import { runEffect } from '../run-effect';
import { toAbsoluteBackupDirectory } from '../to-absolute-backup-directory';
import type { Config } from '../types/config';
import type { Task } from '../types/task';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { startBackupTasks } from './internal/start-backup-tasks';

export const runBackup = (
  config: Config,
  services: TeacupBackupServices,
): Observable<Task> =>
  chain({
    subject: new Subject<Task>(),
    backupDirectory: toAbsoluteBackupDirectory(
      config.backupDirectory,
      services.currentDirectory,
    ),
  })
    .thru(({ subject, backupDirectory }) => ({
      subject,
      backupDirectory,
      createdDirectory:
        services.directoryCreator.createIfDoesntExist(backupDirectory),
    }))
    .thru(({ subject, backupDirectory, createdDirectory }) =>
      runEffect(subject, () =>
        startBackupTasks(
          config,
          backupDirectory,
          createdDirectory,
          subject,
          services,
        ),
      ),
    )
    .thru((subject) => subject.asObservable())
    .value();
