import type { CurrentDirectory } from '@chris.araneo/file-system';

import { getConfigDirectory } from './get-config-directory';

const createCurrentDirectory = (root: unknown): CurrentDirectory =>
  ({
    getExtendedInfo: () => ({ root, cwd: '/work' }),
    getCurrentDirectory: () => '/work',
  }) as unknown as CurrentDirectory;

describe('getConfigDirectory', () => {
  it('should give the application root when the root is known', () => {
    const directory = getConfigDirectory(createCurrentDirectory('/app'));

    expect(directory).toBe('/app');
  });

  it('should give the working folder when the root is missing', () => {
    const directories = [
      getConfigDirectory(createCurrentDirectory(undefined)),
      getConfigDirectory(createCurrentDirectory(null)),
    ];

    expect(directories).toEqual(['/work', '/work']);
  });

  it('should keep an empty root when the root is an empty text', () => {
    const directory = getConfigDirectory(createCurrentDirectory(''));

    expect(directory).toBe('');
  });
});
