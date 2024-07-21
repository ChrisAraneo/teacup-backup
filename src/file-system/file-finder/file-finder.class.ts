import { isString } from 'lodash';
import { Observable, forkJoin, from } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FindFileResult } from './find-file-result.type';

export class FileFinder {
  constructor(private fileSystem: FileSystem = new FileSystem()) {}

  findFile(
    pattern: string | RegExp,
    root: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult> {
    if (!this.fileSystem.existsSync(root)) {
      return from(
        new Promise<FindFileResult>((resolve) =>
          resolve(
            this.createFindFileResult({
              success: false,
              pattern,
              root,
              result: [],
              message: `Root doesn\'t exist: ${root}`,
            }),
          ),
        ),
      );
    }

    return new Observable<FindFileResult>((subscriber) => {
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
              message: JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
                '\\\\',
                '\\',
              ),
            }),
          );
          subscriber.complete();
        });
    });
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
