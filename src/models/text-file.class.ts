import { TextFileWriter } from '../file-system/text-file-writer.class';
import { File } from './file.class';
import fs from 'fs';

export class TextFile extends File<string> {
  async writeToFile(): Promise<void> {
    return new TextFileWriter(fs).writeFile(this); // TODO To property
  }
}
