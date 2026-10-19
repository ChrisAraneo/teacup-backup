import { filterEncryptedFilenames } from './filter-encrypted-filenames';

describe('filterEncryptedFilenames', () => {
  it('should keep the names that hold the backup extension when it gets a folder listing', () => {
    const filenames = filterEncryptedFilenames([
      'alpha_20240315896cf_txt.mbe',
      'notes.txt',
      'old.mbe.bak',
      'mbe',
    ]);

    expect(filenames).toEqual(['alpha_20240315896cf_txt.mbe', 'old.mbe.bak']);
  });

  it('should give no names when the folder is empty', () => {
    const filenames = filterEncryptedFilenames([]);

    expect(filenames).toEqual([]);
  });
});
