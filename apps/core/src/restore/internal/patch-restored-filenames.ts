import type { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import { createRestoredFilename } from '../../filename/create-restored-filename';
import { runEffect } from '../../run-effect';

export const patchRestoredFilenames = (files: Base64File[]): Base64File[] =>
  map(files, (file) =>
    runEffect(file, (value) =>
      value.setFilename(createRestoredFilename(value), value.getExtension()),
    ),
  );
