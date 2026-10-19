import { EncryptedFile } from '@chris.araneo/crypto';
import { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';

import { patchEncryptedFilePaths } from './patch-encrypted-file-paths';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const createEncryptedFile = (path: string, content: string): EncryptedFile =>
  EncryptedFile.fromBase64File(
    new Base64File(path, content, MODIFIED_DATE),
    '',
  );

describe('patchEncryptedFilePaths', () => {
  it('should move every file into the backup folder under its encrypted name when it gets files', () => {
    const files = [
      createEncryptedFile('/root/alpha.txt', 'YWxwaGEgY29udGVudA=='),
      createEncryptedFile('/root/README', 'cmVhZG1lIGNvbnRlbnQ='),
    ];

    const patchedFiles = patchEncryptedFilePaths(files, '/backup');

    expect(map(patchedFiles, (file) => file.getPath())).toEqual([
      '/backup/alpha_20240315896cf_txt.mbe',
      '/backup/README_202403154164f_null.mbe',
    ]);
    expect(patchedFiles[0]).toBe(files[0]);
    expect(patchedFiles[1]).toBe(files[1]);
  });

  it('should give no files when it gets no files', () => {
    const patchedFiles = patchEncryptedFilePaths([], '/backup');

    expect(patchedFiles).toEqual([]);
  });
});
