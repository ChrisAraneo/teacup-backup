import { EncryptedFile } from '@chris.araneo/crypto';
import { Base64File, type CurrentDirectory } from '@chris.araneo/file-system';
import { mkdirSync, mkdtempSync } from 'fs';
import { map } from 'lodash-es';
import { tmpdir } from 'os';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';

import { chain } from '../../chain';
import { runEffect } from '../../run-effect';
import type { Config } from '../../types/config';
import { readEncryptedFiles } from './read-encrypted-files';

const ALPHA_BASE64 = 'YWxwaGEgY29udGVudA==';

const ALPHA_ENCRYPTED_FILENAME = 'alpha_20240315896cf_txt.mbe';

const CONFIG: Config = {
  roots: [],
  files: [],
  mode: 'restore',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
  secret: 'secret',
};

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const writeEncryptedAlpha = (backupDirectory: string): Promise<void> =>
  chain(
    EncryptedFile.fromBase64File(
      new Base64File(
        join(backupDirectory, 'alpha.txt'),
        ALPHA_BASE64,
        new Date('2024-03-15T12:00:00.000Z'),
      ),
      'secret',
    ),
  )
    .thru((file) =>
      runEffect(file, (value) =>
        value.setPath(join(backupDirectory, ALPHA_ENCRYPTED_FILENAME)),
      ),
    )
    .thru((file) => lastValueFrom(file.writeToFile()))
    .value();

describe('readEncryptedFiles', () => {
  it('should decrypt the files and give them their original names when the secret matches', async () => {
    const workDirectory = createTemporaryDirectory();
    mkdirSync(join(workDirectory, 'backup'));
    await writeEncryptedAlpha(join(workDirectory, 'backup'));

    const files = await lastValueFrom(
      readEncryptedFiles([ALPHA_ENCRYPTED_FILENAME], CONFIG, {
        getCurrentDirectory: () => workDirectory,
      } as unknown as CurrentDirectory),
    );

    expect(map(files, (file) => file.getPath())).toEqual([
      join(workDirectory, 'backup', 'alpha.txt'),
    ]);
    expect(map(files, (file) => file.getContent())).toEqual([ALPHA_BASE64]);
  });
});
