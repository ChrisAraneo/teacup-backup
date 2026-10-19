import type { EncryptedFile } from '@chris.araneo/crypto';
import { map } from 'lodash-es';
import { ENCRYPTED_FILE_EXTENSION } from '../../consts';
import { createEncryptedFilename } from '../../filename/create-encrypted-filename';
import { runEffect } from '../../run-effect';

export const patchEncryptedFilePaths = (
  files: EncryptedFile[],
  backupDirectory: string,
): EncryptedFile[] =>
  map(files, (file) =>
    runEffect(file, (value) =>
      value.setPath(
        `${backupDirectory}/${createEncryptedFilename(value)}${ENCRYPTED_FILE_EXTENSION}`,
      ),
    ),
  );
