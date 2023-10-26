import { TextFile } from '../models/text-file.class';
import { TextFileWriter } from './text-file-writer.class';

let fs: any;
let writer: TextFileWriter;

beforeEach(() => {
  fs = {
    writeFile: async (): Promise<void> => {
      return;
    },
  };
  writer = new TextFileWriter(fs);
});

describe('TextFileWriter', () => {
  it('#writeFile should write a text file', () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-10-26'));
    jest.spyOn(fs, 'writeFile');

    writer.writeFile(file);

    const call = jest.mocked(fs.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('Hello World!');
    expect(call[2]).toBe('utf-8');
    expect(typeof call[3]).toBe('function');
  });

  it('#writeFiles should write a text files', () => {
    const files = [
      new TextFile('test.txt', 'Hello World!', new Date('2023-10-26')),
      new TextFile('test2.txt', 'Test', new Date('2023-10-26')),
      new TextFile('test3.txt', 'Lorem ipsum', new Date('2023-10-26')),
    ];
    jest.spyOn(fs, 'writeFile');

    writer.writeFiles(files);

    const calls = jest.mocked(fs.writeFile).mock.calls;
    expect(calls.length).toBe(3);
  });
});
