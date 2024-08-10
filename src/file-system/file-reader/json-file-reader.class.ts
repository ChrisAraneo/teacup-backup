import { Observable, catchError, map, of } from 'rxjs';
import { JsonFile } from '../../models/json-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class JsonFileReader extends FileReader<JsonFile | null> {
  readFile(path: string): Observable<JsonFile | null> {
    return this._readFile(path, 'utf-8').pipe(
      map(
        (result: ReadFileResult) =>
          new JsonFile(result.path, JSON.parse(result.data), result.modifiedDate),
      ),
      catchError(() => of(null)),
    );
  }
}
