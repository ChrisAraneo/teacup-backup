import type { TextFile } from '@chris.araneo/file-system';
import { of } from 'rxjs';

import { createFileWrites } from './create-file-writes';

const WRITE = of(undefined);

const FILE = { writeToFile: () => WRITE } as unknown as TextFile;

describe('createFileWrites', () => {
  it('should give one write for each file when it gets files', () => {
    const writes = createFileWrites([FILE, FILE]);

    expect(writes).toEqual([WRITE, WRITE]);
    expect(writes[0]).toBe(WRITE);
  });

  it('should give no writes when it gets no files', () => {
    const writes = createFileWrites([]);

    expect(writes).toEqual([]);
  });
});
