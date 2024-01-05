import Path from 'path';
import { JsonFile } from '../../models/json-file.class';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { JsonFileReader } from '../file-reader/json-file-reader.class';
import { FileSystem } from '../file-system/file-system.class';
import { Observable, catchError, map } from 'rxjs';

export class ConfigLoader {
  private jsonFileReader: JsonFileReader;

  constructor(
    protected currentDirectory: CurrentDirectory,
    protected fileSystem: FileSystem,
  ) {
    this.jsonFileReader = new JsonFileReader(fileSystem);
  }

  readConfigFile(): Observable<object> {
    const currentDirectory = this.currentDirectory.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);

    return this.jsonFileReader.readFile(path).pipe(
      catchError(() => {
        throw Error(
          "Could not read config.json file. If it doesn't exist then create config.json file in the application directory.",
        );
      }),
      map((result) => {
        if (!result) {
          throw Error('File config.json is empty or incorrect.');
        } else {
          return (result as JsonFile)?.getContent();
        }
      }),
    );
  }
}
