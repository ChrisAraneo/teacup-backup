import { TextFileReader } from './text-file-reader.class';
import { FileSystem } from './file-system.class';

let fileSystem: FileSystem;
let reader: TextFileReader;

class FileSystemMock extends FileSystem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(_path, _data, _options, _callback): Promise<void> {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stat(_path, _callback): void {
    if (['test.txt', 'test2.txt', 'test3.txt'].includes(_path)) {
      _callback(null, {
        mtime: '2023-10-27T21:33:39.661Z',
      });
    } else {
      _callback('Error');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readFile(_path, _encoding, _callback): void {
    if (['test.txt', 'test2.txt', 'test3.txt'].includes(_path)) {
      _callback(null, 'Hello World!');
    } else {
      _callback('Error');
    }
  }
}

beforeEach(() => {
  fileSystem = new FileSystemMock();
  reader = new TextFileReader(fileSystem);
});

describe('TextFileReader', () => {
  it('#readFile should read a text file', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFile('test.txt');

    const call = jest.mocked(fileSystem.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });

  it('#readFiles should read text files', () => {
    jest.spyOn(fileSystem, 'readFile');

    reader.readFiles(['test.txt', 'test2.txt', 'test3.txt']);

    const calls = jest.mocked(fileSystem.readFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
