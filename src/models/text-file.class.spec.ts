import { lastValueFrom } from 'rxjs';
import { FileSystem } from '../file-system/file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system/file-system.mock.class';
import { TextFile } from './text-file.class';

let fileSystem: FileSystem;

beforeEach(() => {
  fileSystem = new FileSystemMock();
});

describe('TextFile', () => {
  it('instance should be created', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));

    expect(file).toBeInstanceOf(TextFile);
  });

  it('#getPath should return correct path', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    const path = file.getPath();

    expect(path).toBe('test.txt');
  });

  it('#getPath should return correct path after change', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    file.setPath('changed.txt');

    expect(file.getPath()).toBe('changed.txt');
  });

  it('#getFilename should return correct filename', async () => {
    const file = new TextFile('test.name.txt', 'Hello World!', new Date('2023-11-11'));
    const path = file.getFilename();

    expect(path).toBe('test.name');
  });

  it('#setFilename should change filename', async () => {
    const file = new TextFile('test.name.txt', 'Hello World!', new Date('2023-11-13'));
    const filename = file.getFilename();
    file.setFilename('test.name2');
    const updated = file.getFilename();

    expect(filename).toBe('test.name');
    expect(updated).toBe('test.name2');
  });

  it('#setFilename should change filename without extension', async () => {
    const file = new TextFile('test.name.txt', 'Hello World!', new Date('2023-11-13'));
    file.setFilename('test', null);

    expect(file.getFilename()).toBe('test');
  });

  it('#getExtension should return correct extension', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    const extension = file.getExtension();

    expect(extension).toBe('txt');
  });

  it('#getExtension should return null', async () => {
    const file = new TextFile('no-extension', 'Hello World!', new Date('2023-11-11'));
    const extension = file.getExtension();

    expect(extension).toBe(null);
  });

  it('#getContent should return correct file content', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    const content = file.getContent();

    expect(content).toStrictEqual('Hello World!');
  });

  it('#getHashValue should return correct hash value', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    const hash = file.getHashValue();

    expect(hash).toBe('ed076287532e86365e841e92bfc50d8c');
  });

  it('#getDate should return correct date', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'));
    const date = file.getModifiedDate();

    expect(date.toISOString()).toBe('2023-11-11T00:00:00.000Z');
  });

  it('#writeToFile should write file', async () => {
    const file = new TextFile('test.txt', 'Hello World!', new Date('2023-11-11'), fileSystem);
    jest.spyOn(fileSystem, 'writeFile');

    await lastValueFrom(file.writeToFile());

    const call = jest.mocked(fileSystem.writeFile).mock.calls[0];
    expect(call[0]).toBe('test.txt');
    expect(call[1]).toBe('Hello World!');
    expect(call[2]).toBe('utf-8');
    expect(typeof call[3]).toBe('function');
  });
});
