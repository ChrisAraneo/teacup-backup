import { firstValueFrom } from 'rxjs';

import { Base64File } from '../../models/base64-file.class';
import { TextFile } from '../../models/text-file.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { Base64FileWriter } from './base64-file-writer.class';

let fileSystem: FileSystem;
let writer: Base64FileWriter;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  writer = new Base64FileWriter(fileSystem);
});

describe('Base64FileWriter', () => {
  it('#writeFile should write a text file', async () => {
    const file = new Base64File('test.txt', 'SGVsbG8gV29ybGQh', new Date('2023-10-26'));
    jest.spyOn(fileSystem, 'writeFile');

    await firstValueFrom(writer.writeFile(file));

    const call = jest.mocked(fileSystem.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('SGVsbG8gV29ybGQh');
    expect(call[2]).toBe('base64');
    expect(typeof call[3]).toBe('function');
  });

  it('#writeFiles should write a text files', async () => {
    const files = [
      new TextFile('test.txt', 'SGVsbG8gV29ybGQh', new Date('2023-10-26')),
      new TextFile('test2.txt', 'VGVzdA==', new Date('2023-10-26')),
      new TextFile('test3.txt', 'TG9yZW0gaXBzdW0=', new Date('2023-10-26')),
    ];
    jest.spyOn(fileSystem, 'writeFile');

    await firstValueFrom(writer.writeFiles(files));

    const calls = jest.mocked(fileSystem.writeFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
