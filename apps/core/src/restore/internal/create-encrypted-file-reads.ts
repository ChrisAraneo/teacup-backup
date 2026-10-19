import { EncryptedFile } from '@chris.araneo/crypto';
import type { CurrentDirectory } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import { normalize } from 'path';
import type { Observable } from 'rxjs';
import { toAbsoluteBackupDirectory } from '../../to-absolute-backup-directory';

export const createEncryptedFileReads = (
  filenames: string[],
  backupDirectory: string,
  currentDirectory: CurrentDirectory,
): Observable<EncryptedFile>[] =>
  map(filenames, (filename) =>
    EncryptedFile.fromEncryptedFile(
      normalize(
        `${toAbsoluteBackupDirectory(backupDirectory, currentDirectory)}/${filename}`,
      ),
    ),
  );
