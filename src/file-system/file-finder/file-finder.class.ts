import { isString } from 'lodash';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FindFileResult } from './find-file-result.type';

export class FileFinder {
  constructor(private fileSystem: FileSystem = new FileSystem()) {}

  findFile(
    pattern: string | RegExp,
    root: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult> {
    return new Observable<FindFileResult>((subscriber) => {
      if (!this.fileSystem.existsSync(root)) {
        subscriber.next(
          this.createFindFileResult({
            success: false,
            pattern,
            root,
            result: [],
            message: `Root doesn\'t exist: ${root}`,
          }),
        );
        subscriber.complete();

        return;
      }

      fileSystem
        .findFile(pattern, root, (result: string[]) => {
          subscriber.next(
            this.createFindFileResult({
              success: true,
              pattern,
              root,
              result: result,
              message: null,
            }),
          );
          subscriber.complete();
        })
        .error((error: Error) => {
          subscriber.next(
            this.createFindFileResult({
              success: true,
              pattern,
              root,
              result: [],
              message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            }),
          );
          subscriber.complete();
        });
    }).pipe(
      catchError((error: unknown) => {
        return of(
          this.createFindFileResult({
            success: false,
            pattern,
            root,
            result: [],
            message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          }),
        );
      }),
    );
  }

  findFiles(
    pattern: string | RegExp,
    roots: string[],
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult[]> {
    return forkJoin(
      roots.map((root: string) => {
        return this.findFile(pattern, root, fileSystem);
      }),
    );
  }

  private createFindFileResult(input: {
    success: boolean;
    pattern: string | RegExp;
    root: string;
    result: string[];
    message: string | null;
  }): FindFileResult {
    return {
      success: input.success,
      pattern: isString(input.pattern) ? input.pattern : input.pattern.toString(),
      root: input.root,
      result: input.result,
      message: input.message,
    };
  }
}
