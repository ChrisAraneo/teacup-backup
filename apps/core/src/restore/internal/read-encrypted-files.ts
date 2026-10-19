import { FileDecryptor } from '@chris.araneo/crypto';
import type { Base64File, CurrentDirectory } from '@chris.araneo/file-system';
import { forkJoin, map, type Observable } from 'rxjs';
import type { Config } from '../../types/config';
import { createEncryptedFileReads } from './create-encrypted-file-reads';
import { patchDecryptedFilenames } from './patch-decrypted-filenames';

export const readEncryptedFiles = (
  filenames: string[],
  config: Config,
  currentDirectory: CurrentDirectory,
): Observable<Base64File[]> =>
  forkJoin(
    createEncryptedFileReads(
      filenames,
      config.backupDirectory,
      currentDirectory,
    ),
  ).pipe(
    map((encryptedFiles) =>
      patchDecryptedFilenames(
        FileDecryptor.decryptBase64Files(encryptedFiles, config.secret ?? ''),
      ),
    ),
  );
