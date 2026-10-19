import { TextFile } from '@chris.araneo/file-system';

import { createRestoredFilename } from './create-restored-filename';

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

describe('createRestoredFilename', () => {
  it('should add the restored mark, the date and the short hash when it gets a file', () => {
    const filename = createRestoredFilename(
      new TextFile('/backup/alpha.txt', 'YWxwaGEgY29udGVudA==', MODIFIED_DATE),
    );

    expect(filename).toBe('alpha_restored_20240315896cf');
  });
});
