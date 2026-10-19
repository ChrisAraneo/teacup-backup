import type { JsonFile } from '@chris.araneo/file-system';
import type { ReadFileError } from '@chris.araneo/file-system/dist/src/file-reader/read-file-error.type';
import type { Observable } from 'rxjs';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { getConfigPath } from './internal/get-config-path';

export const readConfigFile = (
  services: TeacupBackupServices,
): Observable<JsonFile | ReadFileError> =>
  services.jsonFileReader.readFile(getConfigPath(services.currentDirectory));
