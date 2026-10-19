import type { CurrentDirectory } from '@chris.araneo/file-system';
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { map } from 'lodash-es';
import { tmpdir } from 'os';
import { join } from 'path';
import { forkJoin, lastValueFrom } from 'rxjs';

import { createEncryptedFileReads } from './create-encrypted-file-reads';

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createCurrentDirectory = (workDirectory: string): CurrentDirectory =>
  ({ getCurrentDirectory: () => workDirectory }) as unknown as CurrentDirectory;

describe('createEncryptedFileReads', () => {
  it('should read each named file from the backup folder when it gets file names', async () => {
    const workDirectory = createTemporaryDirectory();
    mkdirSync(join(workDirectory, 'backup'));
    writeFileSync(join(workDirectory, 'backup', 'alpha.mbe'), 'U2FsdGVk');

    const files = await lastValueFrom(
      forkJoin(
        createEncryptedFileReads(
          ['alpha.mbe'],
          'backup',
          createCurrentDirectory(workDirectory),
        ),
      ),
    );

    expect(map(files, (file) => file.getPath())).toEqual([
      join(workDirectory, 'backup', 'alpha.mbe'),
    ]);
    expect(map(files, (file) => file.getContent())).toEqual(['U2FsdGVk']);
  });

  it('should give no reads when it gets no file names', () => {
    const reads = createEncryptedFileReads(
      [],
      'backup',
      createCurrentDirectory('/work'),
    );

    expect(reads).toEqual([]);
  });
});
