import Path from 'path';
import { JsonFile } from '../models/json-file.class';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { JsonFileReader } from './json-file-reader.class';
import { FileSystem } from './file-system.class';
import { firstValueFrom } from 'rxjs';

export class ConfigLoader {
  private jsonFileReader: JsonFileReader;

  constructor(
    protected currentDirectoryProvider: CurrentDirectoryProvider,
    protected fileSystem: FileSystem,
  ) {
    this.jsonFileReader = new JsonFileReader(fileSystem);
  }

  async readConfigFile(): Promise<object> {
    const currentDirectory = this.currentDirectoryProvider.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);
    let config: JsonFile | undefined;

    try {
      config = await firstValueFrom(this.jsonFileReader.readFile(path));
    } catch (error: unknown) {
      throw Error(
        'File config.json not found. Create config.json file in the application directory.',
      );
    }

    if (!config) {
      throw Error('File config.json is empty or incorrect.');
    }

    return (config as JsonFile)?.getContent();
  }
}
