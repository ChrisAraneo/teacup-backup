import { DirectoryInfo } from '@chris.araneo/file-system';
import { catchError, EMPTY, map, mergeMap, type Subscription, tap } from 'rxjs';
import { chain } from '../chain';
import { formatErrorText } from '../format-error-text';
import { runEffect } from '../run-effect';
import { toAbsoluteBackupDirectory } from '../to-absolute-backup-directory';
import type { Config } from '../types/config';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { filterEncryptedFilenames } from './internal/filter-encrypted-filenames';
import { readEncryptedFiles } from './internal/read-encrypted-files';
import { writeRestoredFiles } from './internal/write-restored-files';

export const runRestore = (
  config: Config,
  services: TeacupBackupServices,
): Subscription =>
  chain(
    toAbsoluteBackupDirectory(
      config.backupDirectory,
      services.currentDirectory,
    ),
  )
    .thru((backupDirectory) =>
      runEffect(backupDirectory, (directory) =>
        services.directoryCreator.createIfDoesntExist(directory),
      ),
    )
    .thru((backupDirectory) =>
      DirectoryInfo.getContents(backupDirectory, services.fileSystem)
        .pipe(
          map((filenames) => filterEncryptedFilenames(filenames)),
          tap((filenames) =>
            services.logger.info('Decrypting files:', filenames),
          ),
          mergeMap((filenames) =>
            readEncryptedFiles(
              filenames,
              config,
              services.currentDirectory,
            ).pipe(
              mergeMap((decryptedFiles) =>
                writeRestoredFiles(decryptedFiles, services.base64FileWriter),
              ),
            ),
          ),
          tap((restoredFiles) =>
            services.logger.info('Restored:', restoredFiles),
          ),
          catchError((error: unknown) =>
            runEffect(EMPTY, () =>
              services.logger.error(formatErrorText(error)),
            ),
          ),
        )
        .subscribe(),
    )
    .value();
