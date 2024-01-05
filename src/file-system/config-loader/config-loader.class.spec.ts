import { firstValueFrom } from 'rxjs';
import { ConfigLoader } from './config-loader.class';
import { CurrentDirectoryProvider } from '../current-directory-provider/current-directory-provider.class';
import { CurrentDirectoryProviderMock } from '../current-directory-provider/current-directory-provider.mock.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';

let fileSystem: FileSystem;
let currentDirectoryProvider: CurrentDirectoryProvider;
let configLoader: ConfigLoader;

beforeEach(() => {
  fileSystem = new FileSystemMock();
  currentDirectoryProvider = new CurrentDirectoryProviderMock();
  configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);
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
