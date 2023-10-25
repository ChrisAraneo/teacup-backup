import FS from 'fs';
import { File } from '../models/file.class';

export type ReadFileResult = {
  path: string;
  data: string;
  modifiedDate: Date;
};

export abstract class FileWriter<T extends File<any>> {
  constructor(protected encoding: BufferEncoding) {}

  writeFile(file: T): Promise<void> {
    return new Promise((resolve, reject) => {
      FS.writeFile(file.getPath(), file.getContent(), this.encoding, (error: unknown) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  async writeFiles(files: T[]): Promise<void> {
    await Promise.all(files.map((file) => this.writeFile(file)));
  }
}
