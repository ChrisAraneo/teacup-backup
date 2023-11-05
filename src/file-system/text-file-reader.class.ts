import { Observable, map } from 'rxjs';
import { TextFile } from '../models/text-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class TextFileReader extends FileReader<TextFile> {
  readFile(path: string): Observable<TextFile> {
    return this._readFile(path, 'utf-8').pipe(
      map((result: ReadFileResult) => new TextFile(result.path, result.data, result.modifiedDate)),
    );
  }
}
