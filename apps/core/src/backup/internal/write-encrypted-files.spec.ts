import { EncryptedFile } from '@chris.araneo/crypto';
import { Base64File } from '@chris.araneo/file-system';
import { mkdtempSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import { writeEncryptedFiles } from './write-encrypted-files';

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createAlphaFile = (): EncryptedFile =>
  EncryptedFile.fromBase64File(
    new Base64File(
      '/root/alpha.txt',
      'YWxwaGEgY29udGVudA==',
      new Date('2024-03-15T12:00:00.000Z'),
    ),
    'secret',
  );

describe('writeEncryptedFiles', () => {
  it('should write each file under its encrypted name when the backup folder exists', async () => {
    const backupDirectory = createTemporaryDirectory();
    const file = createAlphaFile();

    const writtenFiles = await lastValueFrom(
      writeEncryptedFiles([file], backupDirectory),
    );

    expect(writtenFiles[0]).toBe(file);
    expect(readdirSync(backupDirectory)).toEqual([
      'alpha_20240315896cf_txt.mbe',
    ]);
    expect(
      readFileSync(
        join(backupDirectory, 'alpha_20240315896cf_txt.mbe'),
        'utf-8',
      ),
    ).toBe(file.getContent());
  });

  it('should fail when the backup folder is missing', async () => {
    const backupDirectory = join(createTemporaryDirectory(), 'missing');

    const error = await lastValueFrom(
      writeEncryptedFiles([createAlphaFile()], backupDirectory),
    ).catch((reason: unknown) => reason);

    expect(error).toMatchObject({ code: 'ENOENT' });
  });
});
