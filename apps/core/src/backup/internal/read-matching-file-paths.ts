import { map, type Observable, tap } from 'rxjs';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { toFoundFilePaths } from './to-found-file-paths';

const DEFAULT_SEARCH_ROOTS = ['C:\\'];

export const readMatchingFilePaths = (
  pattern: string | RegExp,
  roots: string[] = DEFAULT_SEARCH_ROOTS,
  services: TeacupBackupServices,
): Observable<string[]> =>
  services.fileFinder.findFiles(pattern, roots).pipe(
    tap((results) => services.logger.debug(JSON.stringify(results))),
    map((results) => toFoundFilePaths(results)),
  );
