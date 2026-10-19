import { TextFile } from '@chris.araneo/file-system';
import type { Observable } from 'rxjs';
import type { Config } from '../types/config';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { getConfigPath } from './internal/get-config-path';
import { serializeConfig } from './internal/serialize-config';

export const writeConfigFile = (
  config: Config | string,
  services: TeacupBackupServices,
  now: () => Date,
): Observable<void> =>
  services.textFileWriter.writeFile(
    new TextFile(
      getConfigPath(services.currentDirectory),
      serializeConfig(config),
      now(),
    ),
  );
