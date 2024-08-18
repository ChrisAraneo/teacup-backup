import { catchError, map, Observable, of } from 'rxjs';

import { Base64File } from '../../models/base64-file.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileReader } from './file-reader.class';
import { ReadFileError } from './read-file-error.type';
import { ReadFileResult } from './read-file-result.type';
import { ReadFileResultStatus } from './read-file-result-status.enum';

export class Base64FileReader extends FileReader<Base64File | ReadFileError> {
  constructor(protected fileSystem: FileSystem) {
    super(fileSystem);
  }

  readFile(path: string): Observable<Base64File | ReadFileError> {
    return this._readFile(path, 'base64').pipe(
      map((result: ReadFileResult) => {
        if (result.status === ReadFileResultStatus.Success) {
          return new Base64File(result.path, result.data, result.modifiedDate);
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
