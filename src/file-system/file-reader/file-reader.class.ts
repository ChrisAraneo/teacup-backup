import { forkJoin, Observable } from 'rxjs';

import { File } from '../../models/file.class';
import { FileSystem } from '../file-system/file-system.class';
import {
  FILE_CONTENT_READING_ERROR_MESSAGE,
  FILE_METADATA_READING_ERROR_MESSAGE,
} from './file-reader.consts';
import { ReadFileError } from './read-file-error.type';
import { ReadFileResult } from './read-file-result.type';
import { ReadFileResultStatus } from './read-file-result-status.enum';

export abstract class FileReader<T extends File<any> | ReadFileError> {
  constructor(protected fileSystem: FileSystem) {}

  readFiles(paths: string[]): Observable<T[]> {
    return forkJoin(paths.map((path: string) => this.readFile(path)));
  }

  protected _readFile(path: string, encoding: BufferEncoding): Observable<ReadFileResult> {
    return new Observable((subscriber) => {
      this.fileSystem.stat(path, (error: unknown, stats) => {
        if (error) {
          subscriber.next({
            status: ReadFileResultStatus.Error,
            message: `${FILE_METADATA_READING_ERROR_MESSAGE} (${path}): ${JSON.stringify(error)}`,
          });
          subscriber.complete();
        } else {
          this.fileSystem.readFile(path, encoding, (error: unknown, data: string) => {
            if (error) {
              subscriber.next({
                status: ReadFileResultStatus.Error,
                message: `${FILE_CONTENT_READING_ERROR_MESSAGE} (${path}): ${JSON.stringify(
                  error,
                )}`,
              });
              subscriber.complete();
            } else {
              subscriber.next({
                status: ReadFileResultStatus.Success,
                path,
                data,
                modifiedDate: new Date(stats.mtime),
              });
              subscriber.complete();
            }
          });
        }
      });
    });
  }

  abstract readFile(path: string): Observable<T>;
}
