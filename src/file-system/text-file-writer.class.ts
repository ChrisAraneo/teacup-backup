import { TextFile } from '../models/text-file.class';
import { FileSystem } from './file-system.class';
import { FileWriter } from './file-writer.class';

export class TextFileWriter extends FileWriter<TextFile> {
  constructor(protected fileSystem: FileSystem) {
    super(fileSystem, 'utf-8');
  }
}
