import { Base64File } from '../models/base64-file.class';
import { FileReader } from './file-reader.class';
import { ReadFileResult } from './read-file-result.type';

export class Base64FileReader extends FileReader<Base64File> {
  async readFile(path: string): Promise<Base64File> {
    return new Promise((resolve, reject) => {
      this._readFile(path, 'base64')
        .catch((error) => reject(error))
        .then((result: ReadFileResult) => {
          resolve(new Base64File(result.path, result.data, result.modifiedDate));
        });
    });
  }
}
