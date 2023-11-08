import { lastValueFrom } from 'rxjs';
import { Base64File } from './base64-file.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { FileSystem } from '../file-system/file-system.class';

let fileSystem: FileSystem;

beforeEach(() => {
  fileSystem = new FileSystemMock();
});

describe('Base64File', () => {
  it('instance should be created', async () => {
    const file = new Base64File('test.txt', 'Hello World!', new Date('2023-11-08'));

    expect(file).toBeInstanceOf(Base64File);
  });

  it('#fromFile should read file and create instance', async () => {
    const file = await lastValueFrom(Base64File.fromFile('test.txt', fileSystem));

    expect(file).toBeInstanceOf(Base64File);
  });

  it('#writeToFile should write file', async () => {
    jest.spyOn(fileSystem, 'writeFile');
    const file = new Base64File('test.txt', 'Hello World!', new Date('2023-11-08'));

    await lastValueFrom(file.writeToFile(fileSystem));

    const call = jest.mocked(fileSystem.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('Hello World!');
    expect(call[2]).toBe('base64');
    expect(typeof call[3]).toBe('function');
  });
});
