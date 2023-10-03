import CryptoJS from "crypto-js";
import CryptoAES from "crypto-js/aes";
import { Base64File } from "./models/base64-file.class";
import { EncryptedFile } from "./models/encrypted-file.class";

type EncryptionResult = {
  path: string;
  content: string;
};

export class FileEncryptor {
  static async encryptBase64Files(
    files: Base64File[],
    secretKey: string
  ): Promise<EncryptionResult[]> {
    return Promise.all(
      files.map((textFile: Base64File) =>
        this.encryptBase64File(textFile, secretKey)
      )
    );
  }

  static encryptBase64File(
    file: Base64File,
    secretKey: string
  ): EncryptionResult {
    let encrypted = "";

    try {
      encrypted = CryptoAES.encrypt(file.getContent(), secretKey).toString(
        CryptoJS.format.OpenSSL
      );
    } catch (error) {
      throw error;
    }

    if (encrypted) {
      return { path: file.getPath(), content: encrypted };
    } else {
      throw Error("Encrypted content is empty!");
    }
  }

  static decryptBase64Files(
    files: EncryptedFile[],
    secretKey: string
  ): Base64File[] {
    return files.map((files: EncryptedFile) =>
      this.decryptBase64File(files, secretKey)
    );
  }

  static decryptBase64File(file: EncryptedFile, secretKey: string): Base64File {
    let decrypted = "";

    try {
      decrypted = CryptoAES.decrypt(file.getContent(), secretKey).toString(
        CryptoJS.enc.Utf8
      );
    } catch (error) {
      throw error;
    }

    if (decrypted) {
      return new Base64File(file.getPath(), file.getContent());
    } else {
      throw Error("Decrypted content is empty!");
    }
  }
}
