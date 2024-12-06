import { AsyncFindStream } from 'find';
import {
  MakeDirectoryOptions,
  PathLike,
  PathOrFileDescriptor,
  Stats,
} from 'fs';
import { isString } from 'lodash';

import { FileSystem } from './file-system.class';

// Stryker disable all : It's mock

export class FileSystemMock extends FileSystem {
  writeFile(_path, _data, _options, _callback): Promise<void> {
    _callback();

    return;
  }

  existsSync(path: PathLike): boolean {
    return !path.toString().includes('notExistingDir');
  }

  stat(
    path: string,
    callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void,
  ): void {
    if (
      this.isCorrectTextFile(path) ||
      this.isCorrectEncryptedFile(path) ||
      this.isCorrectJsonFile(path) ||
      this.isCorrectConfigFile(path)
    ) {
      callback(null, {
        mtime: new Date('2023-10-27T21:33:39.661Z'),
      } as unknown as Stats);
    } else {
      callback('Error' as unknown as NodeJS.ErrnoException, {} as Stats);
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

  readFile(
    path: PathOrFileDescriptor,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: string | undefined;
        } & unknown)
      | BufferEncoding,
    callback: (err: NodeJS.ErrnoException | null, data: string) => void,
  ): void {
    if (this.isCorrectTextFile(path)) {
      callback(null, 'Hello World!');
    } else if (this.isCorrectEncryptedFile(path)) {
      callback(
        null,
        'U2FsdGVkX19B53TiyfRaPnNzSe5uo2K8dIO/fD5h+slCLO30KJAjw4HGKxqRBgGC',
      );
    } else if (this.isCorrectConfigFile(path)) {
      callback(
        null,
        `{"backupDirectory":"./backups","files":["index.ts"],"ftp":{"directory":"teacup-backup/","enabled":true,"host":"192.168.50.1","password":"Qwerty123/","user":"user"},"interval":3600,"log-level":"debug","mode":"backup","roots":["root"]}`,
      );
    } else if (this.isCorrectJsonFile(path)) {
      callback(null, '{"name":"Joel"}');
    } else {
      callback('Error' as unknown as NodeJS.ErrnoException, '');
    }
  }

  findFile(
    pattern: string | RegExp,
    _root: string,
    callback: (files: string[]) => void,
  ): AsyncFindStream {
    if (
      this.isCorrectTextFile(pattern.toString()) ||
      this.isCorrectEncryptedFile(pattern.toString()) ||
      this.isCorrectJsonFile(pattern.toString()) ||
      this.isCorrectConfigFile(pattern.toString())
    ) {
      callback([pattern.toString()]);
    } else {
      throw 'Error';
    }

    return undefined as AsyncFindStream;
  }

  readdir(
    _path: PathLike,
    callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
  ): void {
    callback(null, [
      'test.txt',
      'test2.txt',
      'test3.txt',
      'test.json',
      '/test.json/i',
      'test2.json',
      'test3.json',
    ]);
  }

  private isCorrectTextFile(path: PathOrFileDescriptor): boolean {
    if (!isString(path)) {
      return false;
    }

    return ['test.txt', 'test2.txt', 'test3.txt', 'no-extension'].includes(
      path,
    );
  }

  private isCorrectEncryptedFile(path: PathOrFileDescriptor): boolean {
    if (!isString(path)) {
      return false;
    }

    return [
      'test.mbe',
      'directory/test.mbe',
      'no-extension',
      'directory/no-extension',
    ].includes(path);
  }

  private isCorrectJsonFile(path: PathOrFileDescriptor): boolean {
    if (!isString(path)) {
      return false;
    }

    return [
      'test.json',
      '/test.json/i',
      'test2.json',
      'test3.json',
      'no-extension',
      '/\\/test.json/i',
      'te/st.json',
      '/te\\/st.json/i',
      '/te\\/ist.json/i',
    ].includes(path);
  }

  private isCorrectConfigFile(path: PathOrFileDescriptor): boolean {
    if (!isString(path)) {
      return false;
    }

    return path.includes('config.json');
  }
}
