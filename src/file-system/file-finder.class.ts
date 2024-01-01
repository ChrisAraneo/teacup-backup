import { Observable, forkJoin, from } from 'rxjs';
import { FileSystem } from './file-system.class';
import { FindFileResult } from './find-file-result.type';

export class FileFinder {
  constructor(private fileSystem: FileSystem = new FileSystem()) {}

  findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult> {
    if (!this.fileSystem.existsSync(root)) {
      return from(
        new Promise<FindFileResult>((resolve) =>
          resolve({
            success: false,
            pattern: pattern.toString(),
            root,
            result: [],
            message: `Root doesn\'t exist: ${root}`,
          }),
        ),
      );
    }

    return new Observable<FindFileResult>((subscriber) => {
      fileSystem
        .findFile(pattern, root, (result: string[]) => {
          subscriber.next({
            success: true,
            pattern: pattern.toString(),
            root,
            result: result,
            message: null,
          });
          subscriber.complete();
        })
        .error((error: Error) => {
          subscriber.next({
            success: false,
            pattern: pattern.toString(),
            root,
            result: [],
            message: JSON.stringify(error, Object.getOwnPropertyNames(error)).replace('\\\\', '\\'),
          });
          subscriber.complete();
        });
    });
  }

  findFiles(
    pattern: string | RegExp,
    roots: string[] = ['C:\\'],
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<FindFileResult[]> {
    return forkJoin(
      roots.map((root: string) => {
        return this.findFile(pattern, root, fileSystem);
      }),
    );
  }
}
