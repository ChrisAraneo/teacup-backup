import { lastValueFrom } from 'rxjs';
import { FileFinder } from './file-finder.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';

let fileSystem: FileSystem;
let fileFinder: FileFinder;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  fileFinder = new FileFinder(fileSystem);
});

describe('FileFinder', () => {
  it('#findFile should call file system method', async () => {
    jest.spyOn(fileSystem, 'findFile');

    await lastValueFrom(fileFinder.findFile('test.json', 'D:\\', fileSystem));

    const call = jest.mocked(fileSystem.findFile).mock.calls[0];
    expect(call[0]).toBe('test.json');
    expect(call[1]).toBe('D:\\');
  });

  it("#findFile should return unsuccessful result when root directory doesn't exist", async () => {
    const result = await lastValueFrom(
      fileFinder.findFile('test.json', 'notExistingDir', fileSystem),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Root doesn't exist: notExistingDir");
  });

  it('#findFiles should call file system method', async () => {
    jest.spyOn(fileSystem, 'findFile');

    await lastValueFrom(fileFinder.findFiles('test.json', ['D:\\', 'E:\\', 'F:\\'], fileSystem));

    const calls = jest.mocked(fileSystem.findFile).mock.calls;
    expect(calls.length).toBe(3);
  });

  it("#findFiles should return unsuccessful results when root directories don't exist", async () => {
    jest.spyOn(fileSystem, 'findFile');

    const results = await lastValueFrom(
      fileFinder.findFiles(
        'test.json',
        ['notExistingDir1', 'notExistingDir2', 'notExistingDir3'],
        fileSystem,
      ),
    );

    expect(results[0].success).toBe(false);
    expect(results[1].success).toBe(false);
    expect(results[2].success).toBe(false);
    expect(results[0].message).toBe("Root doesn't exist: notExistingDir1");
    expect(results[1].message).toBe("Root doesn't exist: notExistingDir2");
    expect(results[2].message).toBe("Root doesn't exist: notExistingDir3");
  });
});
