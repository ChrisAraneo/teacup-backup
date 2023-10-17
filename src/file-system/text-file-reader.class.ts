import FS from "fs";
import { TextFile } from "../models/text-file.class";

export class TextFileReader {
  static async readFiles(paths: string[]): Promise<TextFile[]> {
    return Promise.all(paths.map((path: string) => this.readFile(path)));
  }

  static async readFile(path: string): Promise<TextFile> {
    return new Promise((resolve, reject) => {
      FS.stat(path, (error, stats) => {
        if (error) {
          reject(error);
        } else {
          FS.readFile(path, "utf8", (error: unknown, data: string) => {
            if (error) {
              reject(error);
            } else {
              resolve(new TextFile(path, data, new Date(stats.mtime)));
            }
          });
        }
      });
    });
  }
}
