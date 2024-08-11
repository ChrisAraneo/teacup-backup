import { isString } from 'lodash';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { Logger } from '../../utils/logger.class';
import { FileSystem } from '../file-system/file-system.class';
import { FindFileResult } from './find-file-result.type';

export class FileFinder {
  constructor(
    private fileSystem: FileSystem = new FileSystem(),
    private logger?: Logger,
  ) {}

  findFile(
    pattern: string | RegExp,
    root: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult> {
    const _pattern: RegExp = isString(pattern) ? new RegExp(pattern, 'i') : pattern;

    return new Observable<FindFileResult>((subscriber) => {
      if (!this.fileSystem.existsSync(root)) {
        subscriber.next(
          this.createFindFileResult({
            success: false,
            pattern: _pattern,
            root,
            result: [],
            message: `Root doesn\'t exist: ${root}`,
          }),
        );
        subscriber.complete();

        return;
      }

      fileSystem
        .findFile(_pattern, root, (result: string[]) => {
          subscriber.next(
            this.createFindFileResult({
              success: true,
              pattern: _pattern,
              root,
              result: result,
              message: null,
            }),
          );
          subscriber.complete();
        })
        // Stryker disable all : Ignore file system errors like "Error: EBUSY: resource busy or locked"
        .error((error: unknown) => {
          if (this.logger) {
            this.logger.debug(`${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
          }
        });
      // Stryker restore all
    }).pipe(
      catchError((error: unknown) => {
        return of(
          this.createFindFileResult({
            success: false,
            pattern: _pattern,
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
      pattern: input.pattern
        .toString()
        .substring(1, input.pattern.toString().length)
        .replace('/i', ''),
      root: input.root,
      result: input.result.map((item) =>
        item
          .toString()
          .substring(item.indexOf('/') === 0 ? 1 : 0, item.length)
          .replace('/i', ''),
      ),
      message: input.message,
    };
  }
}
