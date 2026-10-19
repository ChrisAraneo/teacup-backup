import type { CurrentDirectory } from '@chris.araneo/file-system';
import { get } from 'lodash-es';

export const getConfigDirectory = (
  currentDirectory: CurrentDirectory,
): string =>
  get(currentDirectory.getExtendedInfo(), 'root') ??
  currentDirectory.getCurrentDirectory();
