import { lastValueFrom } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { Base64FileReader } from './base64-file-reader.class';
import {
  FILE_CONTENT_READING_ERROR_MESSAGE,
  FILE_METADATA_READING_ERROR_MESSAGE,
} from './file-reader.consts';

let fileSystem: FileSystem;
let reader: Base64FileReader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new Base64FileReader(fileSystem);
});

describe('Base64FileReader', () => {
  it('#readFile should read base64 file', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(reader.readFile('test.txt'));

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('base64');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read base64 files', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(reader.readFiles(['test.txt', 'test2.txt', 'test3.txt']));

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });

  it('#readFile should throw error when file system throw error on file read', async () => {
    let error: unknown;
    fileSystem = new ReadFileErrorMock();
    reader = new Base64FileReader(fileSystem);

    try {
      await lastValueFrom(reader.readFile('test.txt'));
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toContain(FILE_CONTENT_READING_ERROR_MESSAGE);
  });

  it('#readFile should throw error when file system throw error on meta-data check', async () => {
    let error: unknown;
    fileSystem = new StatErrorMock();
    reader = new Base64FileReader(fileSystem);

    try {
      await lastValueFrom(reader.readFile('test.txt'));
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toContain(FILE_METADATA_READING_ERROR_MESSAGE);
  });
});

class ReadFileErrorMock extends FileSystemMock {
  readFile(path: string, _options: any, callback: (error: any, data?: any) => any): void {
    callback('error');
  }
}

class StatErrorMock extends FileSystemMock {
  stat(path: string, callback: (error: any, data?: any) => any): void {
    callback('error');
  }
}
