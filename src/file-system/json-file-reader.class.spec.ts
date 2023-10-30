import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';
import { JsonFileReader } from './json-file-reader.class';

let fileSystem: FileSystem;
let reader: JsonFileReader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new JsonFileReader(fileSystem);
});

describe('JsonFileReader', () => {
  it('#readFile should read a text file', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFile('test.json');

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.json');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read text files', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFiles(['test.json', 'test2.json', 'test3.json']);

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
