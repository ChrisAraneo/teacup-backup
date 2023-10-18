import fs from "node:fs";
import { Base64File } from "./models/base64-file.class";
import { TextFile } from "./models/text-file.class";

export class FileProcessor {
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
