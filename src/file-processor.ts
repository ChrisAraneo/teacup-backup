import { Base64File } from "./types";
var fs = require("node:fs");

export class FileProcessor {
  static async readFilesToBase64(files: string[]): Promise<Base64File[]> {
    return Promise.all(
      files.map((path: string) => this.readFileToBase64(path))
    );
  }

  static async writeFilesFromBase64(
    filesInBase64: Base64File[]
  ): Promise<void> {
    await Promise.all(
      filesInBase64.map((file: Base64File) => {
        return this.writeFileFromBase64(file);
      })
    );
  }

  private static readFileToBase64(file: string): Promise<Base64File> {
    return new Promise((resolve, reject) => {
      fs.readFile(
        file,
        { encoding: "base64" },
        (error: unknown, data: string) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              path: file,
              content: data,
            });
          }
        }
      );
    });
  }

  private static writeFileFromBase64(file: Base64File): Promise<void> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(file.content, "base64");

      fs.writeFile(file.path, buffer, (error: unknown) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
