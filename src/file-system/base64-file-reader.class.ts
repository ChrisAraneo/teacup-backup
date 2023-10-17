import FS from "fs";
import { Base64File } from "../models/base64-file.class";

export class Base64FileReader {
  static async readFiles(paths: string[]): Promise<Base64File[]> {
    return Promise.all(paths.map((path) => this.readFile(path)));
  }

  static async readFile(path: string): Promise<Base64File> {
    return new Promise((resolve, reject) => {
      FS.stat(path, (error: unknown, stats) => {
        if (error) {
          reject(error);
        } else {
          FS.readFile(
            path,
            { encoding: "base64" },
            (error: unknown, data: string) => {
              if (error) {
                reject(error);
              } else {
                resolve(new Base64File(path, data, new Date(stats.mtime)));
              }
            }
          );
        }
      });
    });
  }
}
