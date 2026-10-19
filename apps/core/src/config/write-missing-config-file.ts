import { DirectoryInfo } from '@chris.araneo/file-system';
import { includes } from 'lodash-es';
import { first, mergeMap, type Observable, of } from 'rxjs';
import { match } from 'ts-pattern';
import { CONFIG_FILENAME, DEFAULT_CONFIG } from '../consts';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { getConfigDirectory } from './internal/get-config-directory';

export const writeMissingConfigFile = (
  services: TeacupBackupServices,
  writeConfig: (config: string) => Observable<void>,
): Observable<void> =>
  DirectoryInfo.getContents(
    getConfigDirectory(services.currentDirectory),
    services.fileSystem,
  ).pipe(
    first(),
    mergeMap((contents) =>
      match(includes(contents, CONFIG_FILENAME))
        .with(false, () => writeConfig(DEFAULT_CONFIG))
        .otherwise(() => of(undefined)),
    ),
  );
