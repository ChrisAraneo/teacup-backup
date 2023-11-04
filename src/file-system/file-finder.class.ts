import { Observable, forkJoin, map } from 'rxjs';
import { FileSystem } from './file-system.class';

export class FileFinder {
  findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    ignoreErrors: boolean = true,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<string[]> {
    return new Observable<string[]>((subscriber) => {
      fileSystem
        .findFile(pattern, root, (result: string[]) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .error((error) => {
          if (ignoreErrors) {
            subscriber.next([]);
            subscriber.complete();
          } else {
            subscriber.error(error);
          }
        });
    });
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
}
