import { catchError, map, Observable, of } from 'rxjs';

import { TextFile } from '../../models/text-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileError } from './read-file-error.type';
import { ReadFileResult } from './read-file-result.type';
import { ReadFileResultStatus } from './read-file-result-status.enum';

export class TextFileReader extends FileReader<TextFile | ReadFileError> {
  readFile(path: string): Observable<TextFile | ReadFileError> {
    return this._readFile(path, 'utf-8').pipe(
      map((result: ReadFileResult) => {
        if (result.status === ReadFileResultStatus.Success) {
          return new TextFile(result.path, result.data, result.modifiedDate);
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
