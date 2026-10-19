import type { TextFile } from '@chris.araneo/file-system';
import { toFilenameDate } from './internal/to-filename-date';
import { toShortHash } from './internal/to-short-hash';

export const createEncryptedFilename = (file: TextFile): string =>
  `${file.getFilename()}_${toFilenameDate(file.getModifiedDate())}${toShortHash(file.getHashValue())}_${file.getExtension()}`;
