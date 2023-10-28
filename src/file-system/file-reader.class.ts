import { File } from '../models/file.class';
import { ReadFileResult } from './read-file-result.type';
import { FileSystem } from './file-system.class';

export abstract class FileReader<T extends File<any>> {
  constructor(protected fileSystem: FileSystem) {}

  async readFiles(paths: string[]): Promise<T[]> {
    return Promise.all(paths.map((path: string) => this.readFile(path)));
  }

  protected async _readFile(path: string, encoding: BufferEncoding): Promise<ReadFileResult> {
    return new Promise((resolve, reject) => {
      this.fileSystem.stat(path, (error: unknown, stats) => {
        if (error) {
          reject(error);
        } else {
          this.fileSystem.readFile(path, encoding, (error: unknown, data: string) => {
            if (error) {
              reject(error);
            } else {
              resolve({ path, data, modifiedDate: new Date(stats.mtime) }); // TODO Further refactoring?
            }
          });
        }
      });
    });
  }

  abstract readFile(path: string): Promise<T>;
}
