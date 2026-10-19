import { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';

import { patchRestoredFilenames } from './patch-restored-filenames';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('patchRestoredFilenames', () => {
  it('should add the restored mark to every name when it gets files', () => {
    const files = [
      new Base64File(
        '/backup/alpha.txt',
        'YWxwaGEgY29udGVudA==',
        MODIFIED_DATE,
      ),
      new Base64File('/backup/README', 'cmVhZG1lIGNvbnRlbnQ=', MODIFIED_DATE),
    ];

    const patchedFiles = patchRestoredFilenames(files);

    expect(map(patchedFiles, (file) => file.getPath())).toEqual([
      '/backup/alpha_restored_20240315896cf.txt',
      '/backup/README_restored_202403154164f',
    ]);
    expect(patchedFiles[1]).toBe(files[1]);
  });

  it('should give no files when it gets no files', () => {
    const patchedFiles = patchRestoredFilenames([]);

    expect(patchedFiles).toEqual([]);
  });
});
