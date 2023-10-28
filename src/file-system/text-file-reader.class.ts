import { TextFile } from '../models/text-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class TextFileReader extends FileReader<TextFile> {
  async readFile(path: string): Promise<TextFile> {
    return new Promise((resolve, reject) => {
      this._readFile(path, 'utf-8')
        .catch((error) => reject(error))
        .then((result: ReadFileResult) => {
          resolve(new TextFile(result.path, result.data, result.modifiedDate));
        });
    });
  }
}
