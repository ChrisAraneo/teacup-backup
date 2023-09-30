import CryptoAES from "crypto-js/aes";
import { FileFinder } from "./file-finder";
import { Base64File, EncryptedFile } from "./types";

export class MiniBackup {
  async findFiles(
    pattern: string | RegExp,
    roots: string[] = ["C:\\"]
  ): Promise<string[]> {
    return FileFinder.findFiles(pattern, roots);
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
}
