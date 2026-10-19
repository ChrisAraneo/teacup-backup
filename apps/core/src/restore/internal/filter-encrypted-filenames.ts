import { filter, includes } from 'lodash-es';
import { ENCRYPTED_FILE_EXTENSION } from '../../consts';

export const filterEncryptedFilenames = (filenames: string[]): string[] =>
  filter(filenames, (filename) => includes(filename, ENCRYPTED_FILE_EXTENSION));
