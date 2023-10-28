import Path from 'path';
import { JsonFile } from '../models/json-file.class';
import { CurrentDirectoryProvider } from './current-directory-provider';
import { JsonFileReader } from './json-file-reader.class';
import { FileSystem } from './file-system.class';

export class ConfigLoader {
  constructor(protected fileSystem: FileSystem) {}

  async readConfigFile(): Promise<object> {
    const fileSystem = this.fileSystem;
    const currentDirectory = CurrentDirectoryProvider.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);
    let config: JsonFile | undefined;

    try {
      config = await new JsonFileReader(fileSystem).readFile(path); // TODO Move to property
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
