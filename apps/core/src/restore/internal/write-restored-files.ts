import type { Base64File, Base64FileWriter } from '@chris.araneo/file-system';
import { map, type Observable } from 'rxjs';
import { chain } from '../../chain';
import { getFilePaths } from './get-file-paths';
import { patchRestoredFilenames } from './patch-restored-filenames';

export const writeRestoredFiles = (
  files: Base64File[],
  base64FileWriter: Base64FileWriter,
): Observable<string[]> =>
  chain(patchRestoredFilenames(files))
    .thru((patchedFiles) =>
      base64FileWriter
        .writeFiles(patchedFiles)
        .pipe(map(() => getFilePaths(patchedFiles))),
    )
    .value();
