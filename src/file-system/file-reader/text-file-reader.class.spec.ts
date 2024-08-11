import { lastValueFrom } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { TextFileReader } from './text-file-reader.class';

let fileSystem: FileSystem;
let reader: TextFileReader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new TextFileReader(fileSystem);
});

describe('TextFileReader', () => {
  it('#readFile should read a text file', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(reader.readFile('test.txt'));

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read text files', async () => {
    jest.spyOn(fileSystem, 'readFile');

    await lastValueFrom(reader.readFiles(['test.txt', 'test2.txt', 'test3.txt']));

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });

  it('#readFile should return null when file system throw error on file read', async () => {
    fileSystem = new ReadFileErrorMock();
    reader = new TextFileReader(fileSystem);

    const result = await lastValueFrom(reader.readFile('test.txt'));

    expect(result).toBe(null);
  });

  it('#readFile should return null when file system throw error on meta-data check', async () => {
    fileSystem = new StatErrorMock();
    reader = new TextFileReader(fileSystem);

    const result = await lastValueFrom(reader.readFile('test.txt'));

    expect(result).toBe(null);
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
