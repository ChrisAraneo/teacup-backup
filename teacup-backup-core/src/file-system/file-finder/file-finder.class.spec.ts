import { lastValueFrom } from 'rxjs';

import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { FileFinder } from './file-finder.class';

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
    expect(call[0]).toStrictEqual(new RegExp('test.json', 'i'));
    expect(call[1]).toBe('D:\\');
  });

  it('#findFile should return successful result when file found', async () => {
    jest.spyOn(fileSystem, 'findFile');

    const result = await lastValueFrom(
      fileFinder.findFile('test.json', 'D:\\', fileSystem),
    );

    expect(result.success).toBe(true);
    expect(result.pattern).toBe('test.json');
    expect(result.root).toBe('D:\\');
    expect(result.message).toBe(null);
    expect(result.result).toStrictEqual(['test.json']);
  });

  it('#findFile should return successful result when files have filename with slashes found', async () => {
    jest.spyOn(fileSystem, 'findFile');

    const result = [
      await lastValueFrom(
        fileFinder.findFile('/test.json', 'D:\\', fileSystem),
      ),
      await lastValueFrom(
        fileFinder.findFile('te/st.json', 'D:\\', fileSystem),
      ),
      await lastValueFrom(
        fileFinder.findFile('te/ist.json', 'D:\\', fileSystem),
      ),
    ];

    expect(result).toStrictEqual([
      {
        message: null,
        pattern: '/test.json',
        result: ['/test.json'],
        root: 'D:\\',
        success: true,
      },
      {
        message: null,
        pattern: 'te/st.json',
        result: ['te/st.json'],
        root: 'D:\\',
        success: true,
      },
      {
        message: null,
        pattern: '/te/ist.json',
        result: ['/te/ist.json'],
        root: 'D:\\',
        success: true,
      },
    ]);
  });

  it("#findFile should return unsuccessful result when root directory doesn't exist", async () => {
    const result = await lastValueFrom(
      fileFinder.findFile('test.json', 'notExistingDir', fileSystem),
    );

    expect(result.success).toBe(false);
    expect(result.pattern).toBe('test.json');
    expect(result.root).toBe('notExistingDir');
    expect(result.message).toBe("Root doesn't exist: notExistingDir");
    expect(result.result).toStrictEqual([]);
  });

  it('#findFile should return unsuccessful result when file was not found', async () => {
    const result = await lastValueFrom(
      fileFinder.findFile('this-file-does-not-exist__', 'C:\\\\', fileSystem),
    );

    expect(result.success).toBe(false);
    expect(result.pattern).toBe('this-file-does-not-exist__');
    expect(result.root).toBe('C:\\\\');
    expect(result.message).toBe('"Error"');
    expect(result.result).toStrictEqual([]);
  });

  it('#findFiles should call file system method', async () => {
    jest.spyOn(fileSystem, 'findFile');

    await lastValueFrom(
      fileFinder.findFiles('test.json', ['D:\\', 'E:\\', 'F:\\'], fileSystem),
    );

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
