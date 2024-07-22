import { AsyncFindStream } from 'find';
import { MakeDirectoryOptions, PathLike } from 'fs';
import { FileSystem } from './file-system.class';

export class FileSystemMock extends FileSystem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(_path, _data, _options, _callback): Promise<void> {
    _callback();

    return;
  }

  existsSync(path: PathLike): boolean {
    return !path.toString().includes('notExistingDir');
  }

  stat(path: string, callback: (error: any, data?: any) => any): void {
    if (
      this.isCorrectTextFile(path) ||
      this.isCorrectEncryptedFile(path) ||
      this.isCorrectJsonFile(path) ||
      this.isCorrectConfigFile(path)
    ) {
      callback(null, {
        mtime: '2023-10-27T21:33:39.661Z',
      });
    } else {
      callback('Error');
    }
  }

  mkdirSync(
    path: PathLike,
    options?: MakeDirectoryOptions & {
      recursive: true;
    },
    callback?: (err: NodeJS.ErrnoException | null, path?: string) => void,
  ): void {
    return callback(null, path as string);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readFile(path: string, _options, callback: (error: any, data?: any) => any): void {
    if (this.isCorrectTextFile(path)) {
      callback(null, 'Hello World!');
    } else if (this.isCorrectEncryptedFile(path)) {
      callback(null, 'U2FsdGVkX19B53TiyfRaPnNzSe5uo2K8dIO/fD5h+slCLO30KJAjw4HGKxqRBgGC');
    } else if (this.isCorrectConfigFile(path)) {
      callback(
        null,
        `{"backupDirectory":".\/backups","files":["index.ts"],"ftp":{"directory":"teacup-backup\/","enabled":true,"host":"192.168.50.1","password":"Qwerty123\/","user":"user"},"interval":3600,"log-level":"debug","mode":"backup","roots":["root"]}`,
      );
    } else if (this.isCorrectJsonFile(path)) {
      callback(null, '{"name":"Joel"}');
    } else {
      callback('Error');
    }
  }

  findFile(
    pattern: string | RegExp,
    _root: string,
    callback: (files: string[]) => void,
  ): AsyncFindStream {
    if (
      typeof pattern === 'string' &&
      (this.isCorrectTextFile(pattern) ||
        this.isCorrectEncryptedFile(pattern) ||
        this.isCorrectJsonFile(pattern) ||
        this.isCorrectConfigFile(pattern))
    ) {
      callback([pattern as string]);
    } else {
      throw 'Error';
    }

    return undefined as AsyncFindStream;
  }

  readdir(
    _path: PathLike,
    callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
  ): void {
    callback(null, ['test.txt', 'test2.txt', 'test3.txt', 'test.json', 'test2.json', 'test3.json']);
  }

  private isCorrectTextFile(path: string): boolean {
    return ['test.txt', 'test2.txt', 'test3.txt', 'no-extension'].includes(path);
  }

  private isCorrectEncryptedFile(path: string): boolean {
    return ['test.mbe', 'directory/test.mbe', 'no-extension', 'directory/no-extension'].includes(
      path,
    );
  }

  private isCorrectJsonFile(path: string): boolean {
    return ['test.json', 'test2.json', 'test3.json', 'no-extension'].includes(path);
  }

  private isCorrectConfigFile(path: string): boolean {
    return path.includes('config.json');
  }
}
