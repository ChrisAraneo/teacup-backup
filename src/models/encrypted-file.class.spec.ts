import { lastValueFrom } from 'rxjs';
import { Base64File } from './base64-file.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { FileSystem } from '../file-system/file-system.class';
import { EncryptedFile } from './encrypted-file.class';

let fileSystem: FileSystem;

beforeEach(() => {
  fileSystem = new FileSystemMock();
});

describe('EncryptedFile', () => {
  it('#fromBase64File should create encrypted file', async () => {
    const encrypted = new Base64File('test.txt', 'Hello World!', new Date('2023-11-01'));
    const file = EncryptedFile.fromBase64File(encrypted, 'secret-key');

    expect(file).toBeInstanceOf(EncryptedFile);
  });

  it('#fromEncryptedFile should read file', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(EncryptedFile.fromEncryptedFile('test.txt', fileSystem));

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });

  it('#writeToFile should write file', async () => {
    const file = await lastValueFrom(EncryptedFile.fromEncryptedFile('test.txt', fileSystem));
    jest.spyOn(fileSystem, 'writeFile');

    await lastValueFrom(file.writeToFile(fileSystem));

    const call = jest.mocked(fileSystem.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('Hello World!');
    expect(call[2]).toBe('utf-8');
    expect(typeof call[3]).toBe('function');
  });
});
