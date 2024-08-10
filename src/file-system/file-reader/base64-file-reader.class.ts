import { Observable, catchError, map, of } from 'rxjs';
import { Base64File } from '../../models/base64-file.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class Base64FileReader extends FileReader<Base64File | null> {
  constructor(protected fileSystem: FileSystem) {
    super(fileSystem);
  }

  readFile(path: string): Observable<Base64File | null> {
    return this._readFile(path, 'base64').pipe(
      map(
        (result: ReadFileResult) => new Base64File(result.path, result.data, result.modifiedDate),
      ),
      catchError(() => of(null)),
    );
  }
}
