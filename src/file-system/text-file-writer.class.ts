import { TextFile } from '../models/text-file.class';
import { FileWriter } from './file-writer.class';

export class TextFileWriter extends FileWriter<TextFile> {
  constructor() {
    super('utf-8');
  }
}
