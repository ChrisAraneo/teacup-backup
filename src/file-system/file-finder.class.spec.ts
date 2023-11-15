import { lastValueFrom } from 'rxjs';
import { FileFinder } from './file-finder.class';
import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';

let fileSystem: FileSystem;
let fileFinder: FileFinder;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  fileFinder = new FileFinder();
});

describe('FileFinder', () => {
  it('#findFile should call file system method', async () => {
    jest.spyOn(fileSystem, 'findFile');

    await lastValueFrom(fileFinder.findFile('test.json', 'D:\\', false, fileSystem));

    const call = jest.mocked(fileSystem.findFile).mock.calls[0];
    expect(call[0]).toBe('test.json');
    expect(call[1]).toBe('D:\\');
  });

  it('#findFiles should call file system method', async () => {
    jest.spyOn(fileSystem, 'findFile');

    await lastValueFrom(
      fileFinder.findFiles('test.json', ['D:\\', 'E:\\', 'F:\\'], false, fileSystem),
    );

    const calls = jest.mocked(fileSystem.findFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
