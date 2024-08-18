import { lastValueFrom } from 'rxjs';

import { TextFile } from '../../models/text-file.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { TextFileWriter } from './text-file-writer.class';

let fileSystem: FileSystem;
let writer: TextFileWriter;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  writer = new TextFileWriter(fileSystem);
});

describe('TextFileWriter', () => {
  it('#writeFile should write a text file', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-10-26'));
    jest.spyOn(fileSystem, 'writeFile');

    await lastValueFrom(writer.writeFile(file));

    const call = jest.mocked(fileSystem.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('Hello World!');
    expect(call[2]).toBe('utf-8');
    expect(typeof call[3]).toBe('function');
  });

  it('#writeFiles should write a text files', async () => {
    const files = [
      new TextFile('test.txt', 'Hello World!', new Date('2023-10-26')),
      new TextFile('test2.txt', 'Test', new Date('2023-10-26')),
      new TextFile('test3.txt', 'Lorem ipsum', new Date('2023-10-26')),
    ];
    jest.spyOn(fileSystem, 'writeFile');

    await lastValueFrom(writer.writeFiles(files));

    const calls = jest.mocked(fileSystem.writeFile).mock.calls;
    expect(calls.length).toBe(3);
  });

  it('#writeFiles should throw error when file system failed to write file', async () => {
    const files = [
      new TextFile('test.txt', 'Hello World!', new Date('2023-10-26')),
      new TextFile('test2.txt', 'Test', new Date('2023-10-26')),
      new TextFile('test3.txt', 'Lorem ipsum', new Date('2023-10-26')),
    ];
    let error: unknown;
    fileSystem = new FileWriteErrorMock();
    writer = new TextFileWriter(fileSystem);

    try {
      await lastValueFrom(writer.writeFiles(files));
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toBe('Error');
  });
});

class FileWriteErrorMock extends FileSystemMock {
  async writeFile(_path, _data, _options, _callback): Promise<void> {
    _callback('Error');
  }
}
