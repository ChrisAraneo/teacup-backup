import type { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import { chain } from '../../chain';
import { createDecryptedFilename } from '../../filename/create-decrypted-filename';
import { runEffect } from '../../run-effect';

export const patchDecryptedFilenames = (files: Base64File[]): Base64File[] =>
  map(files, (file) =>
    chain(createDecryptedFilename(file.getFilename()))
      .thru(({ filename, extension }) =>
        runEffect(file, (value) => value.setFilename(filename, extension)),
      )
      .value(),
  );
