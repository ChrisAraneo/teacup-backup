import { TextFileWriter } from '../file-system/text-file-writer.class';
import { File } from './file.class';
import { FileSystem } from './../file-system/file-system.class';

export class TextFile extends File<string> {
  protected textFileWriter: TextFileWriter;

  async writeToFile(fileSystem: FileSystem = new FileSystem()): Promise<void> {
    if (!this.textFileWriter) {
      this.textFileWriter = new TextFileWriter(fileSystem);
    }

    return this.textFileWriter.writeFile(this);
  }
}
