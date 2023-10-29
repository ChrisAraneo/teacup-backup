import { FileSystem } from './file-system.class';
import { Base64FileReader } from './base64-file-reader.class';
import { FileSystemMock } from './file-system.mock.class';

let fileSystem: FileSystem;
let reader: Base64FileReader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new Base64FileReader(fileSystem);
});

describe('Base64FileReader', () => {
  it('#readFile should read base64 file', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFile('test.txt');

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('base64');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read base64 files', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFiles(['test.txt', 'test2.txt', 'test3.txt']);

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
