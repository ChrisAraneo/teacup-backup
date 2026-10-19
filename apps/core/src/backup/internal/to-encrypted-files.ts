import { EncryptedFile } from '@chris.araneo/crypto';
import type { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import { forkJoin, type Observable, of } from 'rxjs';

export const toEncryptedFiles = (
  files: Base64File[],
  secret: string,
): Observable<EncryptedFile[]> =>
  forkJoin(
    map(files, (file) => of(EncryptedFile.fromBase64File(file, secret))),
  );
