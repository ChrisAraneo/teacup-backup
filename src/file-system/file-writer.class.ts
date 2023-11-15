import { Observable, forkJoin, map } from 'rxjs';
import { File } from '../models/file.class';
import { FileSystem } from './file-system.class';

export abstract class FileWriter<T extends File<any>> {
  constructor(
    protected fileSystem: FileSystem,
    protected encoding: BufferEncoding,
  ) {}

  writeFile(file: T): Observable<void> {
    return new Observable((subscriber) => {
      this.fileSystem.writeFile(
        file.getPath(),
        file.getContent(),
        this.encoding,
        (error: unknown) => {
          if (error) {
            subscriber.error(error);
          } else {
            subscriber.next(undefined);
            subscriber.complete();
          }
        },
      );
    });
  }

  writeFiles(files: T[]): Observable<void> {
    return forkJoin(files.map((file) => this.writeFile(file))).pipe(map(() => {}));
  }
}
