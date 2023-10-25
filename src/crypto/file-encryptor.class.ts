import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import { Base64File } from '../models/base64-file.class';
import { EncryptionResult } from './encryption-result.type';

export class FileEncryptor {
  static async encryptBase64Files(
    files: Base64File[],
    secretKey: string,
  ): Promise<EncryptionResult[]> {
    return Promise.all(
      files.map((textFile: Base64File) => this.encryptBase64File(textFile, secretKey)),
    );
  }

  static encryptBase64File(file: Base64File, secretKey: string): EncryptionResult {
    let encrypted = '';

    try {
      encrypted = CryptoAES.encrypt(file.getContent(), secretKey).toString(CryptoJS.format.OpenSSL);
    } catch (error) {
      throw error;
    }

    if (encrypted) {
      return { path: file.getPath(), content: encrypted };
    } else {
      throw Error('Encrypted content is empty!');
    }
  }
}
