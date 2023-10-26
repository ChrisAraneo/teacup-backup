import { TextFile } from '../models/text-file.class';
import { FileWriter } from './file-writer.class';

export class TextFileWriter extends FileWriter<TextFile> {
  constructor(protected fs) {
    super(fs, 'utf-8');
  }
}
