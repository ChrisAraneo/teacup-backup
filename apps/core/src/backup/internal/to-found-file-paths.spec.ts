import type { FindFileResult } from '@chris.araneo/file-system/dist/src/file-finder/find-file-result.type';

import { toFoundFilePaths } from './to-found-file-paths';

const createFindFileResult = (result: string[]): FindFileResult => ({
  success: true,
  pattern: 'alpha',
  root: '/root',
  result,
  message: null,
});

describe('toFoundFilePaths', () => {
  it('should join the found paths of every root in order when it gets search results', () => {
    const paths = toFoundFilePaths([
      createFindFileResult(['/root/a.txt', '/root/b.txt']),
      createFindFileResult([]),
      createFindFileResult(['/other/c.txt']),
    ]);

    expect(paths).toEqual(['/root/a.txt', '/root/b.txt', '/other/c.txt']);
  });

  it('should give no paths when it gets no search results', () => {
    const paths = toFoundFilePaths([]);

    expect(paths).toEqual([]);
  });
});
