import { File } from '../models/file.class';
import { FileSystem } from './file-system.class';

export abstract class FileWriter<T extends File<any>> {
  constructor(
    protected fileSystem: FileSystem,
    protected encoding: BufferEncoding,
  ) {}

  writeFile(file: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fileSystem.writeFile(
        file.getPath(),
        file.getContent(),
        this.encoding,
        (error: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        },
      );
    });
  }

  async writeFiles(files: T[]): Promise<void> {
    await Promise.all(files.map((file) => this.writeFile(file)));
  }
}
