import CryptoAES from "crypto-js/aes";
import find from "find";
import { Base64File, EncryptedFile } from "./types";

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

  async encryptTextFiles(
    textFiles: Base64File[],
    secretKey: string
  ): Promise<EncryptedFile[]> {
    return Promise.all(
      textFiles.map((textFile: Base64File) =>
        this.encryptTextFile(textFile, secretKey)
      )
    );
  }

  private async encryptTextFile(
    textFile: Base64File,
    secretKey: string
  ): Promise<EncryptedFile> {
    return new Promise<EncryptedFile>(async (resolve, reject) => {
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
