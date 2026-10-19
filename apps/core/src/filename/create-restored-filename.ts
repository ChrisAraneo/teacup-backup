import type { TextFile } from '@chris.araneo/file-system';
import { toFilenameDate } from './internal/to-filename-date';
import { toShortHash } from './internal/to-short-hash';

export const createRestoredFilename = (file: TextFile): string =>
  `${file.getFilename()}_restored_${toFilenameDate(file.getModifiedDate())}${toShortHash(file.getHashValue())}`;
