import { FileSystem } from './file-system.class';

export class FileSystemMock extends FileSystem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(_path, _data, _options, _callback): Promise<void> {
    return;
  }

  stat(path: string, callback: (error: any, data?: any) => any): void {
    if (['test.txt', 'test2.txt', 'test3.txt'].includes(path) || path.includes('config.json')) {
      callback(null, {
        mtime: '2023-10-27T21:33:39.661Z',
      });
    } else {
      callback('Error');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readFile(path: string, _options, callback: (error: any, data?: any) => any): void {
    if (['test.txt', 'test2.txt', 'test3.txt'].includes(path)) {
      callback(null, 'Hello World!');
    } else if (path.includes('config.json')) {
      callback(
        null,
        '{"backupDirectory":"./backups","files":[{"filename":"this-is-example-filename.txt"}],"interval":3600,"mode":"backup","roots":["C:\\\\","D:\\\\","E:\\\\"]}',
      );
    } else {
      callback('Error');
    }
  }
}
