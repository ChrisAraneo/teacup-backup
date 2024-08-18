import { Observable } from 'rxjs';

import { FileSystem } from '../file-system/file-system/file-system.class';
import { TextFileWriter } from '../file-system/file-writer/text-file-writer.class';
import { File } from './file.class';

export class TextFile extends File<string> {
  protected textFileWriter: TextFileWriter;

  constructor(
    protected path: string,
    protected content: string,
    protected modifiedDate: Date,
    protected fileSystem: FileSystem = new FileSystem(),
  ) {
    super(path, content, modifiedDate);
    this.textFileWriter = new TextFileWriter(fileSystem);
  }

  writeToFile(): Observable<void> {
    return this.textFileWriter.writeFile(this);
  }
}
