import { catchError, map, Observable, of } from 'rxjs';

import { JsonFile } from '../../models/json-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileError } from './read-file-error.type';
import { ReadFileResult } from './read-file-result.type';
import { ReadFileResultStatus } from './read-file-result-status.enum';

export class JsonFileReader extends FileReader<JsonFile | ReadFileError> {
  readFile(path: string): Observable<JsonFile | ReadFileError> {
    return this._readFile(path, 'utf-8').pipe(
      map((result: ReadFileResult) => {
        if (result.status === ReadFileResultStatus.Success) {
          return new JsonFile(result.path, JSON.parse(result.data), result.modifiedDate);
        } else {
          return result;
        }
      }),
      catchError((error: unknown) =>
        of({ status: ReadFileResultStatus.Error, message: error?.toString() } as ReadFileError),
      ),
    );
  }
}
