import Path from 'path';
import { JsonFile } from '../models/json-file.class';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { JsonFileReader } from './json-file-reader.class';
import { FileSystem } from './file-system.class';

export class ConfigLoader {
  private jsonFileReader: JsonFileReader;

  constructor(protected fileSystem: FileSystem) {
    this.jsonFileReader = new JsonFileReader(fileSystem);
  }

  async readConfigFile(): Promise<object> {
    const currentDirectory = CurrentDirectoryProvider.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);
    let config: JsonFile | undefined;

    try {
      config = await this.jsonFileReader.readFile(path);
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
