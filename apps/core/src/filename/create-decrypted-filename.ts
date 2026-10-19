import { chain } from '../chain';
import type { DecryptedFilename } from './types/decrypted-filename';

export const createDecryptedFilename = (
  encryptedFilename: string,
): DecryptedFilename =>
  chain(encryptedFilename.lastIndexOf('_'))
    .thru(
      (underscoreIndex): DecryptedFilename => ({
        filename: encryptedFilename.substring(
          0,
          encryptedFilename.lastIndexOf('_', underscoreIndex - 1),
        ),
        extension: encryptedFilename.substring(underscoreIndex + 1),
      }),
    )
    .value();
