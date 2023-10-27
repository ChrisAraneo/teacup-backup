import { TextFileReader } from './text-file-reader.class';

let fs: any;
let reader: TextFileReader;

beforeEach(() => {
  fs = {
    stat: (path: string, callback): void => {
      if (path === 'test.txt') {
        callback(null, {
          mtime: '2023-10-27T21:33:39.661Z',
        });
      } else {
        callback('Error');
      }
    },
    readFile: (path, encoding, callback): void => {
      if (path === 'test.txt') {
        callback(null, 'Hello World!');
      } else {
        callback('Error');
      }
    },
  };
  reader = new TextFileReader(fs);
});

describe('TextFileReader', () => {
  it('#readFile should read a text file', () => {
    jest.spyOn(fs, 'readFile');

    reader.readFile('test.txt');

    const call = jest.mocked(fs.readFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('utf-8');
    expect(typeof call[2]).toBe('function');
  });
});
