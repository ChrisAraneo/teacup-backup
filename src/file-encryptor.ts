import CryptoAES from "crypto-js/aes";
import { Base64File, EncryptedFile } from "./types";

export class FileEncryptor {
  static async encryptBase64Files(
    files: Base64File[],
    secretKey: string
  ): Promise<EncryptedFile[]> {
    return Promise.all(
      files.map((textFile: Base64File) =>
        this.encryptBase64File(textFile, secretKey)
      )
    );
  }

  static async encryptBase64File(
    file: Base64File,
    secretKey: string
  ): Promise<EncryptedFile> {
    return new Promise<EncryptedFile>(async (resolve, reject) => {
      let encrypted = "";

      try {
        encrypted = CryptoAES.encrypt(file.content, secretKey).toString();
      } catch (error) {
        reject(error);
      }

      if (encrypted) {
        resolve({
          path: file.path,
          content: encrypted,
        });
      } else {
        reject(encrypted);
      }
    });
  }
}
