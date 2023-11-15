import { lastValueFrom } from 'rxjs';
import { DirectoryInfo } from './directory-info.class';
import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';

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
});
