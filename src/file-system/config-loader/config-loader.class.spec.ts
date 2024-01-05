import { firstValueFrom } from 'rxjs';
import { ConfigLoader } from './config-loader.class';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { CurrentDirectoryMock } from '../current-directory/current-directory.mock.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';

let fileSystem: FileSystem;
let currentDirectory: CurrentDirectory;
let configLoader: ConfigLoader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  currentDirectory = new CurrentDirectoryMock();
  configLoader = new ConfigLoader(currentDirectory, fileSystem);
});

describe('ConfigLoader', () => {
  it('#readConfigFile should read config.json', async () => {
    const config = await firstValueFrom(configLoader.readConfigFile());

    expect(config).toStrictEqual({
      backupDirectory: './backups',
      files: [{ filename: 'this-is-example-filename.txt' }],
      interval: 3600,
      mode: 'backup',
      roots: ['C:\\', 'D:\\', 'E:\\'],
    });
  });
});
