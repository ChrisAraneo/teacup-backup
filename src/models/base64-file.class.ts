import { Observable, map } from 'rxjs';
import { Base64FileReader } from '../file-system/base64-file-reader.class';
import { Base64FileWriter } from '../file-system/base64-file-writer.class';
import { FileSystem } from '../file-system/file-system.class';
import { TextFile } from './text-file.class';

export class Base64File extends TextFile {
  private static base64FileReader: Base64FileReader;

  static fromFile(path: string, fileSystem: FileSystem = new FileSystem()): Observable<Base64File> {
    if (!this.base64FileReader) {
      this.base64FileReader = new Base64FileReader(fileSystem);
    }

    return this.base64FileReader
      .readFile(path)
      .pipe(
        map(
          (result) =>
            new Base64File(result.getPath(), result.getContent(), result.getModifiedDate()),
        ),
      );
  }

  writeToFile(fileSystem: FileSystem = new FileSystem()): Observable<void> {
    return new Base64FileWriter(fileSystem).writeFile(this);
  }
}
