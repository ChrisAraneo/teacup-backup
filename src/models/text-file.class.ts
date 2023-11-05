import { lastValueFrom } from 'rxjs';
import { TextFileWriter } from '../file-system/text-file-writer.class';
import { FileSystem } from './../file-system/file-system.class';
import { File } from './file.class';

export class TextFile extends File<string> {
  protected textFileWriter: TextFileWriter;

  async writeToFile(fileSystem: FileSystem = new FileSystem()): Promise<void> {
    if (!this.textFileWriter) {
      this.textFileWriter = new TextFileWriter(fileSystem);
    }

    return await lastValueFrom(this.textFileWriter.writeFile(this));
  }
}
