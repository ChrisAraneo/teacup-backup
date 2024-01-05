import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { DirectoryCreator } from './directory-creator.class';
import { Logger } from '../../utils/logger.class';

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

    new DirectoryCreator(fileSystem, logger).createIfDoesntExist('notExistingDir');

    const existsSyncCall = jest.mocked(fileSystem.existsSync).mock.calls[0][0];
    const mkdirSyncCall = jest.mocked(fileSystem.mkdirSync).mock.calls[0][0];
    expect(existsSyncCall).toBe('notExistingDir');
    expect(mkdirSyncCall).toBe('notExistingDir');
  });

  it('#createIfDoesntExist should not call mkdir file system method when provided existing directory', async () => {
    jest.spyOn(fileSystem, 'existsSync');
    jest.spyOn(fileSystem, 'mkdirSync');

    new DirectoryCreator(fileSystem, logger).createIfDoesntExist('existingDir');

    const existsSyncCall = jest.mocked(fileSystem.existsSync).mock.calls[0][0];
    const mkdirSyncCalls = jest.mocked(fileSystem.mkdirSync).mock.calls;
    expect(existsSyncCall).toBe('existingDir');
    expect(mkdirSyncCalls).toHaveLength(0);
  });
});
