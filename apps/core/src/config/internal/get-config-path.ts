import type { CurrentDirectory } from '@chris.araneo/file-system';
import { CONFIG_FILENAME } from '../../consts';
import { getConfigDirectory } from './get-config-directory';

export const getConfigPath = (currentDirectory: CurrentDirectory): string =>
  `${getConfigDirectory(currentDirectory)}/${CONFIG_FILENAME}`;
