import { TextFile } from '@chris.araneo/file-system';

import { createEncryptedFilename } from './create-encrypted-filename';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('createEncryptedFilename', () => {
  it('should join the name, the date, the short hash and the extension when the file has an extension', () => {
    const filename = createEncryptedFilename(
      new TextFile('/root/alpha.txt', 'YWxwaGEgY29udGVudA==', MODIFIED_DATE),
    );

    expect(filename).toBe('alpha_20240315896cf_txt');
  });

  it('should write null as the extension when the file has no extension', () => {
    const filename = createEncryptedFilename(
      new TextFile('/root/README', 'cmVhZG1lIGNvbnRlbnQ=', MODIFIED_DATE),
    );

    expect(filename).toBe('README_202403154164f_null');
  });
});
