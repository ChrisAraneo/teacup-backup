import { Observable, catchError, map, of } from 'rxjs';
import { TextFile } from '../../models/text-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class TextFileReader extends FileReader<TextFile | null> {
  readFile(path: string): Observable<TextFile | null> {
    return this._readFile(path, 'utf-8').pipe(
      map((result: ReadFileResult) => new TextFile(result.path, result.data, result.modifiedDate)),
      catchError(() => of(null)),
    );
  }
}
