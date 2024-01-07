import { Base64File } from '../../models/base64-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';
import { FileSystem } from '../file-system/file-system.class';
import { Observable, map } from 'rxjs';

export class Base64FileReader extends FileReader<Base64File> {
  constructor(protected fileSystem: FileSystem) {
    super(fileSystem);
  }

  readFile(path: string): Observable<Base64File> {
    return this._readFile(path, 'base64').pipe(
      map(
        (result: ReadFileResult) => new Base64File(result.path, result.data, result.modifiedDate),
      ),
    );
  }
}
