import { firstValueFrom, lastValueFrom } from 'rxjs';
import { DirectoryInfo } from './directory-info.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { PathLike } from 'node:fs';

let fileSystem: FileSystem;

beforeEach(() => {
  fileSystem = new FileSystemMock();
});

describe('DirectoryInfo', () => {
  it('#getContents should call file system method', async () => {
    jest.spyOn(fileSystem, 'readdir');

    await lastValueFrom(DirectoryInfo.getContents('./', fileSystem));

    const call = jest.mocked(fileSystem.readdir).mock.calls[0];
    expect(call[0]).toBe('./');
  });

  it('#getContents should throw error', async () => {
    let error: unknown;
    fileSystem = new ReadDirectoryErrorFileSystemMock();

    try {
      await firstValueFrom(DirectoryInfo.getContents('./', fileSystem));
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});

export class ReadDirectoryErrorFileSystemMock extends FileSystemMock {
  readdir(
    _path: PathLike,
    callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
  ): void {
    callback(
      {
        name: 'error',
        message: 'error',
        errno: 500,
        code: '500',
        path: _path.toString(),
        syscall: _path.toString(),
      },
      [],
    );
  }
}
