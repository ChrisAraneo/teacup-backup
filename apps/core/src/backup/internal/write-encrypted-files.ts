import type { EncryptedFile } from '@chris.araneo/crypto';
import { forkJoin, map, type Observable } from 'rxjs';
import { chain } from '../../chain';
import { createFileWrites } from './create-file-writes';
import { patchEncryptedFilePaths } from './patch-encrypted-file-paths';

export const writeEncryptedFiles = (
  files: EncryptedFile[],
  backupDirectory: string,
): Observable<EncryptedFile[]> =>
  chain(patchEncryptedFilePaths(files, backupDirectory))
    .thru((patchedFiles) =>
      forkJoin(createFileWrites(patchedFiles)).pipe(map(() => patchedFiles)),
    )
    .value();
