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

  static async decryptBase64Files(
    files: EncryptedFile[],
    secretKey: string
  ): Promise<Base64File[]> {
    return Promise.all(
      files.map((files: EncryptedFile) =>
        this.decryptBase64File(files, secretKey)
      )
    );
  }

  static async decryptBase64File(
    file: EncryptedFile,
    secretKey: string
  ): Promise<Base64File> {
    return new Promise<Base64File>(async (resolve, reject) => {
      let decrypted = "";

      try {
        decrypted = CryptoAES.decrypt(file.content, secretKey).toString();
      } catch (error) {
        reject(error);
      }

      if (decrypted) {
        resolve({
          path: file.path,
          content: decrypted,
        });
      } else {
        reject(decrypted);
      }
    });
  }
}
