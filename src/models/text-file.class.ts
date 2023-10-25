import { TextFileWriter } from '../file-system/text-file-writer.class';
import { File } from './file.class';

export class TextFile extends File<string> {
  async writeToFile(): Promise<void> {
    return new TextFileWriter().writeFile(this); // TODO To property
  }
}
