import { lastValueFrom } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
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
});
