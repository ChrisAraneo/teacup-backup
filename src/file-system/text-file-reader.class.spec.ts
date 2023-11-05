import { TextFileReader } from './text-file-reader.class';
import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';
import { lastValueFrom } from 'rxjs';

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
});
