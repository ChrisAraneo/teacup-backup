import { createDecryptedFilename } from './create-decrypted-filename';

describe('createDecryptedFilename', () => {
  it('should split off the date and the extension when it gets an encrypted name', () => {
    const decrypted = createDecryptedFilename('alpha_20240315896cf_txt');

    expect(decrypted).toEqual({ filename: 'alpha', extension: 'txt' });
  });

  it('should keep the null extension when the file had no extension', () => {
    const decrypted = createDecryptedFilename('README_202403154164f_null');

    expect(decrypted).toEqual({ filename: 'README', extension: 'null' });
  });

  it('should keep the underscores of the name when the name holds underscores', () => {
    const decrypted = createDecryptedFilename('my_notes_20240315896cf_md');

    expect(decrypted).toEqual({ filename: 'my_notes', extension: 'md' });
  });

  it('should give an empty name when the name holds no underscore', () => {
    const decrypted = createDecryptedFilename('plain');

    expect(decrypted).toEqual({ filename: '', extension: 'plain' });
  });
});
