import CryptoAES from "crypto-js/aes";
import fileBase64 from "file-base64";
import find from "find";
import fs from "fs";
import { TextFile } from "./types";

export class MiniBackup {
  async findFiles(
    pattern: string | RegExp,
    roots: string[] = ["C:\\"]
  ): Promise<string[]> {
    const result: string[] = [];

    const promises = roots.map((root: string) => {
      return this.findFile(pattern, root);
    });

    (await Promise.all(promises)).map((items: string[]) =>
      result.push(...items)
    );

    return result;
  }

  async readFilesToBase64(files: string[]): Promise<TextFile[]> {
    return Promise.all(
      files.map((path: string) => {
        return new Promise((resolve, reject) => {
          fileBase64.encode(path, (error, result: string) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                path,
                content: result,
              });
            }
          });
        });
      })
    ) as Promise<TextFile[]>;
  }

  async encryptTextFiles(
    textFiles: TextFile[],
    secretKey: string
  ): Promise<TextFile[]> {
    return Promise.all(
      textFiles.map((textFile: TextFile) =>
        this.encryptTextFile(textFile, secretKey)
      )
    );
  }

  private async encryptTextFile(
    textFile: TextFile,
    secretKey: string
  ): Promise<TextFile> {
    return new Promise<TextFile>(async (resolve, reject) => {
      let encrypted = "";

      try {
        encrypted = await CryptoAES.encrypt(
          textFile.content,
          secretKey
        ).toString();
      } catch (error) {
        reject(error);
      }

      if (encrypted) {
        resolve({
          path: textFile.path,
          content: encrypted,
        });
      }
    });
  }

  private async findFile(
    pattern: string | RegExp,
    root: string = "C:\\"
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      find
        .file(pattern, root, (result) => {
          resolve(result);
        })
        .error((error) => {
          reject(error);
        });
    });
  }
}
