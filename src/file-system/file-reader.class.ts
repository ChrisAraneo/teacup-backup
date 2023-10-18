import FS from "fs";
import { File } from "../models/file.class";

export type ReadFileResult = {
  path: string;
  data: string;
  modifiedDate: Date;
};

export abstract class FileReader<T extends File<any>> {
  abstract readFile(path: string): Promise<T>;

  async readFiles(paths: string[]): Promise<T[]> {
    return Promise.all(paths.map((path: string) => this.readFile(path)));
  }

  protected async _readFile(
    path: string,
    encoding: BufferEncoding
  ): Promise<ReadFileResult> {
    return new Promise((resolve, reject) => {
      FS.stat(path, (error: unknown, stats) => {
        if (error) {
          reject(error);
        } else {
          FS.readFile(path, encoding, (error: unknown, data: string) => {
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
}
