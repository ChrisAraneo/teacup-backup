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
  it('instance should be created', async () => {
    const file = await lastValueFrom(EncryptedFile.fromEncryptedFile('test.mbe', fileSystem));

    expect(file).toBeInstanceOf(EncryptedFile);
  });

  it('#getPath should return correct path', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const path = file.getPath();

    expect(path).toBe('directory/test.mbe');
  });

  it('#getFilename should return correct filename', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const path = file.getFilename();

    expect(path).toBe('test');
  });

  it('#getExtension should return correct extension', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const extension = file.getExtension();

    expect(extension).toBe('mbe');
  });

  it('#getContent should return correct file content', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const content = file.getContent();

    expect(content).toBe('U2FsdGVkX19B53TiyfRaPnNzSe5uo2K8dIO/fD5h+slCLO30KJAjw4HGKxqRBgGC');
  });

  it('#getHashValue should return correct hash value', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const hash = file.getHashValue();

    expect(hash).toBe('1569236e09c70c952c9316000ab6ff14');
  });

  it('#getDate should return correct date', async () => {
    const file = await lastValueFrom(
      EncryptedFile.fromEncryptedFile('directory/test.mbe', fileSystem),
    );
    const date = file.getModifiedDate();

    expect(date.toISOString()).toBe('2023-10-27T21:33:39.661Z');
  });

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
