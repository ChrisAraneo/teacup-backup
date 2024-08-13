import { filter, map, Observable } from 'rxjs';

import { Base64FileReader } from '../file-system/file-reader/base64-file-reader.class';
import { FileSystem } from '../file-system/file-system/file-system.class';
import { Base64FileWriter } from '../file-system/file-writer/base64-file-writer.class';
import { TextFile } from './text-file.class';

export class Base64File extends TextFile {
  private static base64FileReader: Base64FileReader;

  static fromFile(path: string, fileSystem: FileSystem = new FileSystem()): Observable<Base64File> {
    this.base64FileReader = new Base64FileReader(fileSystem);

    return this.base64FileReader.readFile(path).pipe(
      filter((result) => result instanceof Base64File),
      map(
        (result) => new Base64File(result.getPath(), result.getContent(), result.getModifiedDate()),
      ),
    );
  }

  writeToFile(fileSystem: FileSystem = new FileSystem()): Observable<void> {
    return new Base64FileWriter(fileSystem).writeFile(this);
  }
}
