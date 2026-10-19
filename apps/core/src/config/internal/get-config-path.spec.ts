import type { CurrentDirectory } from '@chris.araneo/file-system';

import { getConfigPath } from './get-config-path';

const CURRENT_DIRECTORY = {
  getExtendedInfo: () => ({ root: '/app' }),
  getCurrentDirectory: () => '/work',
} as unknown as CurrentDirectory;

describe('getConfigPath', () => {
  it('should put the config file in the application root when the root is known', () => {
    const configPath = getConfigPath(CURRENT_DIRECTORY);

    expect(configPath).toBe('/app/config.json');
  });
});
