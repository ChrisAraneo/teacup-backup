import type { TextFile } from '@chris.araneo/file-system';
import { map } from 'lodash-es';

export const getFilePaths = (files: TextFile[]): string[] =>
  map(files, (file) => file.getPath());
