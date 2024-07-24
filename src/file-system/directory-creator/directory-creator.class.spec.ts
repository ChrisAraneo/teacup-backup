import { MakeDirectoryOptions, PathLike } from 'fs';
import { Logger } from '../../utils/logger.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { DirectoryCreator } from './directory-creator.class';
import { CREATE_DIRECTORY_ERROR_MESSAGE } from './directory-creator.consts';

let fileSystem: FileSystem;
let logger: Logger;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  logger = new Logger();
});

describe('DirectoryCreator', () => {
  it('#createIfDoesntExist should call mkdir file system method when provided non existing directory', async () => {
    jest.spyOn(fileSystem, 'existsSync');
    jest.spyOn(fileSystem, 'mkdirSync');

    await new DirectoryCreator(fileSystem, logger).createIfDoesntExist('notExistingDir');

    const existsSyncCall = jest.mocked(fileSystem.existsSync).mock.calls[0][0];
    const mkdirSyncCall = jest.mocked(fileSystem.mkdirSync).mock.calls[0][0];
    expect(existsSyncCall).toBe('notExistingDir');
    expect(mkdirSyncCall).toBe('notExistingDir');
  });

  it('#createIfDoesntExist should not call mkdir file system method when provided existing directory', async () => {
    jest.spyOn(fileSystem, 'existsSync');
    jest.spyOn(fileSystem, 'mkdirSync');

    await new DirectoryCreator(fileSystem, logger).createIfDoesntExist('existingDir');

    const existsSyncCall = jest.mocked(fileSystem.existsSync).mock.calls[0][0];
    const mkdirSyncCalls = jest.mocked(fileSystem.mkdirSync).mock.calls;
    expect(existsSyncCall).toBe('existingDir');
    expect(mkdirSyncCalls).toHaveLength(0);
  });

  it('#createIfDoesntExist should throw error when file system called callback with error', async () => {
    jest.spyOn(logger, 'debug');

    fileSystem = new CreateDirectoryCallbackErrorFileSystemMock();

    expect(
      new DirectoryCreator(fileSystem, logger).createIfDoesntExist('notExistingDir'),
    ).rejects.toEqual(CREATE_DIRECTORY_ERROR_MESSAGE);
  });

  it('#createIfDoesntExist should throw error when file system called callback with undefined path', async () => {
    jest.spyOn(logger, 'debug');

    fileSystem = new CreateDirectoryNoCallbackPathFileSystemMock();

    expect(
      new DirectoryCreator(fileSystem, logger).createIfDoesntExist('notExistingDir'),
    ).rejects.toEqual(CREATE_DIRECTORY_ERROR_MESSAGE);
  });

  it('#createIfDoesntExist should log correct debug messages when provided not existing directory', async () => {
    jest.spyOn(logger, 'debug');

    await new DirectoryCreator(fileSystem, logger).createIfDoesntExist('notExistingDir');

    const debugCalls = jest.mocked(logger.debug).mock.calls;

    expect(debugCalls[0][0]).toBe("Creating directory: 'notExistingDir'");
    expect(debugCalls[1][0]).toBe('Created directory');
  });

  it('#createIfDoesntExist should log correct debug message when provided existing directory', async () => {
    jest.spyOn(logger, 'debug');

    await new DirectoryCreator(fileSystem, logger).createIfDoesntExist('existingDir');

    const debugCalls = jest.mocked(logger.debug).mock.calls;

    expect(debugCalls[0][0]).toBe('Directory already exists');
  });
});

class CreateDirectoryCallbackErrorFileSystemMock extends FileSystemMock {
  mkdirSync(
    path: PathLike,
    options?: MakeDirectoryOptions & { recursive: true },
    callback?: (err: NodeJS.ErrnoException | null, path?: string) => void,
  ): void {
    callback(
      {
        errno: 500,
        code: '500',
        path: 'path',
        name: 'error',
        message: 'test',
      },
      null,
    );
  }
}

class CreateDirectoryNoCallbackPathFileSystemMock extends FileSystemMock {
  mkdirSync(
    path: PathLike,
    options?: MakeDirectoryOptions & { recursive: true },
    callback?: (err: NodeJS.ErrnoException | null, path?: string) => void,
  ): void {
    callback(null, undefined);
  }
}
