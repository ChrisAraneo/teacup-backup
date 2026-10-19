import { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';

import { patchDecryptedFilenames } from './patch-decrypted-filenames';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('patchDecryptedFilenames', () => {
  it('should give every file its original name back when it gets decrypted files', () => {
    const files = [
      new Base64File(
        '/backup/alpha_20240315896cf_txt.mbe',
        'YWxwaGEgY29udGVudA==',
        MODIFIED_DATE,
      ),
      new Base64File(
        '/backup/README_202403154164f_null.mbe',
        'cmVhZG1lIGNvbnRlbnQ=',
        MODIFIED_DATE,
      ),
    ];

    const patchedFiles = patchDecryptedFilenames(files);

    expect(map(patchedFiles, (file) => file.getPath())).toEqual([
      '/backup/alpha.txt',
      '/backup/README.null',
    ]);
    expect(patchedFiles[0]).toBe(files[0]);
  });

  it('should give no files when it gets no files', () => {
    const patchedFiles = patchDecryptedFilenames([]);

    expect(patchedFiles).toEqual([]);
  });
});
