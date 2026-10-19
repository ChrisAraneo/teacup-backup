import { TextFile } from '@chris.araneo/file-system';

import { getFilePaths } from './get-file-paths';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('getFilePaths', () => {
  it('should give the path of every file in order when it gets files', () => {
    const paths = getFilePaths([
      new TextFile('/backup/alpha.txt', '', MODIFIED_DATE),
      new TextFile('/backup/README', '', MODIFIED_DATE),
    ]);

    expect(paths).toEqual(['/backup/alpha.txt', '/backup/README']);
  });

  it('should give no paths when it gets no files', () => {
    const paths = getFilePaths([]);

    expect(paths).toEqual([]);
  });
});
