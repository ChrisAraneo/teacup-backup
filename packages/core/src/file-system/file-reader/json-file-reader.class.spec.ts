import { PathOrFileDescriptor, Stats } from 'fs';
import { lastValueFrom } from 'rxjs';

import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { JsonFileReader } from './json-file-reader.class';

let fileSystem: FileSystem;
let reader: JsonFileReader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new JsonFileReader(fileSystem);
});

describe('JsonFileReader', () => {
  it('#readFile should read a text file', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(reader.readFile('test.json'));

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.json');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read text files', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(
      reader.readFiles(['test.json', 'test2.json', 'test3.json']),
    );

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });

  it('#readFile should return error object when file system throw error on file read', async () => {
    fileSystem = new ReadFileErrorMock();
    reader = new JsonFileReader(fileSystem);

    const result = await lastValueFrom(reader.readFile('test.txt'));

    expect(result).toStrictEqual({
      message: 'Error while reading file content (test.txt): "error"',
      status: 'error',
    });
  });

  it('#readFile should return error object when file system throw error on meta-data check', async () => {
    fileSystem = new StatErrorMock();
    reader = new JsonFileReader(fileSystem);

    const result = await lastValueFrom(reader.readFile('test.txt'));

    expect(result).toStrictEqual({
      message: 'Error while reading file metadata (test.txt): "error"',
      status: 'error',
    });
  });
});

class ReadFileErrorMock extends FileSystemMock {
  readFile(
    path: PathOrFileDescriptor,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: string | undefined;
        } & unknown)
      | BufferEncoding,
    callback: (err: NodeJS.ErrnoException | null, data: string) => void,
  ): void {
    callback('error' as unknown as NodeJS.ErrnoException, '');
  }
}

class StatErrorMock extends FileSystemMock {
  stat(
    path: string,
    callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void,
  ): void {
    callback(
      'error' as unknown as NodeJS.ErrnoException,
      {} as unknown as Stats,
    );
  }
}
