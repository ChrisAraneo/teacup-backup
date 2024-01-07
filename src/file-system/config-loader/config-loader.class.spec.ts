import { firstValueFrom } from 'rxjs';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { CurrentDirectoryMock } from '../current-directory/current-directory.mock.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { ConfigLoader } from './config-loader.class';
import { CONFIG_READING_ERROR_MESSAGE, INVALID_CONFIG_ERROR_MESSAGE } from './config-loader.consts';

let fileSystem: FileSystem;
let currentDirectory: CurrentDirectory;
let configLoader: ConfigLoader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  currentDirectory = new CurrentDirectoryMock();
  configLoader = new ConfigLoader(currentDirectory, fileSystem);
});

describe('ConfigLoader', () => {
  it('#readConfigFile should return config object when file contains valid config', async () => {
    const config = await firstValueFrom(configLoader.readConfigFile());

    expect(config).toStrictEqual({
      backupDirectory: './backups',
      files: ['index.ts'],
      ftp: {
        directory: 'mini-backup/',
        enabled: true,
        host: '192.168.50.1',
        password: 'Qwerty123/',
        user: 'user',
      },
      interval: 3600,
      'log-level': 'debug',
      mode: 'backup',
      roots: ['root'],
    });
  });

  it('#readConfigFile should throw error when file contains invalid properties or values', async () => {
    fileSystem = new InvalidConfigFileSystemMock();
    configLoader = new ConfigLoader(currentDirectory, fileSystem);

    try {
      await firstValueFrom(configLoader.readConfigFile());
    } catch (error: any) {
      expect(error?.message).toBe(INVALID_CONFIG_ERROR_MESSAGE);
    }
  });

  it('#readConfigFile should throw error when file is invalid json', async () => {
    fileSystem = new InvalidJsonFileSystemMock();
    configLoader = new ConfigLoader(currentDirectory, fileSystem);

    try {
      await firstValueFrom(configLoader.readConfigFile());
    } catch (error: any) {
      expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
    }
  });

  it('#readConfigFile should throw error when result of reading file is empty', async () => {
    fileSystem = new EmptyConfigFileSystemMock();
    configLoader = new ConfigLoader(currentDirectory, fileSystem);

    try {
      await firstValueFrom(configLoader.readConfigFile());
    } catch (error: any) {
      expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
    }
  });
});

class InvalidConfigFileSystemMock extends FileSystemMock {
  readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
    callback(null, `{"interval": null}`);
  }
}

class InvalidJsonFileSystemMock extends FileSystemMock {
  readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
    callback(null, `Hello World!`);
  }
}

class EmptyConfigFileSystemMock extends FileSystemMock {
  readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
    callback(null, undefined);
  }
}
