import { FileDecryptor } from '@chris.araneo/crypto';
import { Base64File } from '@chris.araneo/file-system';
import { compact, map } from 'lodash-es';
import { lastValueFrom, toArray } from 'rxjs';

import { toEncryptedFiles } from './to-encrypted-files';

const ALPHA_BASE64 = 'YWxwaGEgY29udGVudA==';

const createAlphaFile = (): Base64File =>
  new Base64File(
    '/root/alpha.txt',
    ALPHA_BASE64,
    new Date('2024-03-15T12:00:00.000Z'),
  );

describe('toEncryptedFiles', () => {
  it('should encrypt the content with the secret when it gets a secret', async () => {
    const [encryptedFile] = await lastValueFrom(
      toEncryptedFiles([createAlphaFile()], 'secret'),
    );

    expect(encryptedFile?.getPath()).toBe('/root/alpha.txt');
    expect(encryptedFile?.getContent()).not.toBe(ALPHA_BASE64);
    expect(
      map(
        FileDecryptor.decryptBase64Files(compact([encryptedFile]), 'secret'),
        (file) => file.getContent(),
      ),
    ).toEqual([ALPHA_BASE64]);
  });

  it('should keep the content as it is when the secret is empty', async () => {
    const [encryptedFile] = await lastValueFrom(
      toEncryptedFiles([createAlphaFile()], ''),
    );

    expect(encryptedFile?.getContent()).toBe(ALPHA_BASE64);
  });

  it('should finish without a value when it gets no files', async () => {
    const events = await lastValueFrom(
      toEncryptedFiles([], 'secret').pipe(toArray()),
    );

    expect(events).toEqual([]);
  });
});
