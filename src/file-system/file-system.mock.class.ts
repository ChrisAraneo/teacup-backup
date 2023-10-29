import { FileSystem } from './file-system.class';

export class FileSystemMock extends FileSystem {
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
