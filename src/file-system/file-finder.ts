import { Observable, forkJoin, from, map } from 'rxjs';
import { FileSystem } from './file-system.class';

export class FileFinder {
  findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    ignoreErrors: boolean = true,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<string[]> {
    return from(this._findFile(pattern, root, ignoreErrors, fileSystem));
  }

  findFiles(
    pattern: string | RegExp,
    roots: string[] = ['C:\\'],
    ignoreErrors: boolean = true,
  ): Observable<string[]> {
    const observables = roots.map((root: string) => {
      return this.findFile(pattern, root, ignoreErrors);
    });

    return forkJoin(observables).pipe(
      map((arrays: string[][]) => {
        const result: string[] = [];

        arrays.forEach((array: string[]) => {
          result.push(...array);
        });

        return result;
      }),
    );
  }

  private _findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    ignoreErrors: boolean = true,
    fileSystem: FileSystem = new FileSystem(),
  ): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fileSystem
        .findFile(pattern, root, (result: string[]) => {
          resolve(result);
        })
        .error((error) => {
          if (!ignoreErrors) {
            reject(error);
          } else {
            resolve([]);
          }
        });
    });
  }
}
