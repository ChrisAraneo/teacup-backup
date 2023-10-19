import fs from "node:fs";

export class FileProcessor {
  static async listContentsOfDirectory(directory: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (error: unknown, files: string[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }
}
