import type { JsonFile } from '@chris.araneo/file-system';
import type { ReadFileError } from '@chris.araneo/file-system/dist/src/file-reader/read-file-error.type';
import type { Logger } from '@chris.araneo/logger';
import { type Observable, Subscription } from 'rxjs';
import { runBackup } from './backup/run-backup';
import { readConfigFile } from './config/read-config-file';
import { writeConfigFile } from './config/write-config-file';
import { writeMissingConfigFile } from './config/write-missing-config-file';
import { createCurrentDate } from './create-current-date';
import { createTeacupBackupServices } from './create-teacup-backup-services';
import { runRestore } from './restore/run-restore';
import type { Config } from './types/config';
import type { Task } from './types/task';
import type { TeacupBackupServices } from './types/teacup-backup-services';

// Stryker disable all

export class TeacupBackup {
  private readonly services: TeacupBackupServices;
  private readonly subscription: Subscription;

  constructor(private readonly logger: Logger) {
    this.services = createTeacupBackupServices(this.logger);
    this.subscription = new Subscription();
  }

  writeDefaultConfigWhenDoesntExist(): Observable<void> {
    return writeMissingConfigFile(this.services, (config) =>
      this.writeConfig(config),
    );
  }

  readConfig(): Observable<JsonFile | ReadFileError> {
    return readConfigFile(this.services);
  }

  writeConfig(config: Config | string): Observable<void> {
    return writeConfigFile(config, this.services, createCurrentDate);
  }

  runBackupFlow(config: Config): Observable<Task> {
    return runBackup(config, this.services);
  }

  runRestoreFlow(config: Config): void {
    this.subscription.add(runRestore(config, this.services));
  }
}
