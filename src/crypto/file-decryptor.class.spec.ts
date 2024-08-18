import { lastValueFrom } from 'rxjs';

import { FileSystem } from '../file-system/file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system/file-system.mock.class';
import { EncryptedFile } from '../models/encrypted-file.class';
import { FileDecryptor } from './file-decryptor.class';

let fileSystem: FileSystem;

beforeEach(() => {
  fileSystem = new FileSystemMock();
});

describe('FileDecryptor', () => {
  it('#decryptBase64File should decrypt base64 file', async () => {
    const file = await lastValueFrom(EncryptedFile.fromEncryptedFile('test.mbe', fileSystem));

    const result = FileDecryptor.decryptBase64File(file, 'secret');
    const base64 = result.getContent();
    const text = Buffer.from(base64, 'base64').toString('ascii');

    expect(base64).toBe('SGVsbG8gV29ybGQh');
    expect(text).toBe('Hello World!');
  });

  it('#decryptBase64Files should decrypt base64 files', async () => {
    const files = [
      await lastValueFrom(EncryptedFile.fromEncryptedFile('test.mbe', fileSystem)),
      await lastValueFrom(EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem)),
    ];

    const result = FileDecryptor.decryptBase64Files(files, 'secret');
    const base64s = result.map((item) => item.getContent());
    const texts = [
      Buffer.from(base64s[0], 'base64').toString('ascii'),
      Buffer.from(base64s[1], 'base64').toString('ascii'),
    ];

    expect(base64s).toStrictEqual(['SGVsbG8gV29ybGQh', 'SGVsbG8gV29ybGQh']);
    expect(texts).toStrictEqual(['Hello World!', 'Hello World!']);
  });

  it('#decryptBase64File should throw error when provided incorrect file', async () => {
    expect(() => FileDecryptor.decryptBase64File(null, 'secret')).toThrowError();
  });
});
