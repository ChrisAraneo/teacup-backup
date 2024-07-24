import { JsonFile } from './json-file.class';

describe('JsonFile', () => {
  it('instance should be created', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));

    expect(file).toBeInstanceOf(JsonFile);
  });

  it('#getPath should return correct path', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const path = file.getPath();

    expect(path).toBe('test.json');
  });

  it('#getPath should return correct path after change', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    file.setPath('changed.json');

    expect(file.getPath()).toBe('changed.json');
  });

  it('#getFilename should return correct filename', async () => {
    const file = new JsonFile('test.name.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const path = file.getFilename();

    expect(path).toBe('test.name');
  });

  it('#setFilename should change filename', async () => {
    const file = new JsonFile('test.name.json', { name: 'Tommy' }, new Date('2023-11-13'));
    const filename = file.getFilename();
    file.setFilename('test.name2', 'json');
    const updated = file.getFilename();

    expect(filename).toBe('test.name');
    expect(updated).toBe('test.name2');
  });

  it('#setFilename should change filename without extension', async () => {
    const file = new JsonFile('test.name.json', { name: 'Tommy' }, new Date('2023-11-13'));
    file.setFilename('test');

    expect(file.getFilename()).toBe('test');
  });

  it('#getExtension should return correct extension', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const extension = file.getExtension();

    expect(extension).toBe('json');
  });

  it('#getExtension should return null', async () => {
    const file = new JsonFile('no-extension', { name: 'Tommy' }, new Date('2023-11-10'));
    const extension = file.getExtension();

    expect(extension).toBe(null);
  });

  it('#getContent should return correct file content', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const content = file.getContent();

    expect(content).toStrictEqual({ name: 'Tommy' });
  });

  it('#getHashValue should return correct hash value', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const hash = file.getHashValue();

    expect(hash).toBe('1441a7909c087dbbe7ce59881b9df8b9');
  });

  it('#getDate should return correct date', async () => {
    const file = new JsonFile('test.json', { name: 'Tommy' }, new Date('2023-11-10'));
    const date = file.getModifiedDate();

    expect(date.toISOString()).toBe('2023-11-10T00:00:00.000Z');
  });
});
