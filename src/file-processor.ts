import { Base64File } from "./models/base64-file.class";
import { TextFile } from "./models/text-file.class";

const fs = require("node:fs");

export class FileProcessor {
  static async readFilesToBase64(paths: string[]): Promise<Base64File[]> {
    return Promise.all(
      paths.map((path) => this.readFileToBase64(path))
    );
  }

  static async readFileToBase64(path: string): Promise<Base64File> {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path,
        { encoding: "base64" },
        (error: unknown, data: string) => {
          if (error) {
            reject(error);
          } else {
            resolve(new Base64File(path, data));
          }
        }
      );
    });
  }

  static async readTextFiles(paths: string[]): Promise<TextFile[]> {
    return Promise.all(paths.map((path: string) => this.readTextFile(path)));
  }

  static async readTextFile(path: string): Promise<TextFile> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (error: unknown, data: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(new TextFile(path, data));
        }
      });
    });
  }

  static async writeFilesFromBase64(
    filesInBase64: Base64File[]
  ): Promise<void> {
    await Promise.all(
      filesInBase64.map((file) => this.writeFileFromBase64(file))
    );
  }

  static async writeFileFromBase64(file: Base64File): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        file.getPath(),
        file.getContent(),
        { encoding: "base64" },
        (error: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }

  static async writeTextFiles(files: TextFile[]): Promise<void> {
    await Promise.all(files.map((file) => this.writeTextFile(file)));
  }

  static async writeTextFile(file: TextFile): Promise<void> {
    console.log('writeTextFile!', file.getPath());
    return new Promise((resolve, reject) => {
      fs.writeFile(
        file.getPath(),
        file.getContent(),
        "utf8",
        (error: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }
}
