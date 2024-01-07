import { Observable } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';

export class DirectoryInfo {
  static getContents(
    directory: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<string[]> {
    return new Observable((subscriber) => {
      fileSystem.readdir(directory, (error: unknown, files: string[]) => {
        if (error) {
          subscriber.error(error);
        } else {
          subscriber.next(files);
          subscriber.complete();
        }
      });
    });
  }
}
