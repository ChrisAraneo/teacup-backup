import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import { Base64File } from '../models/base64-file.class';
import { EncryptionResult } from './encryption-result.type';

export class FileEncryptor {
  static encryptBase64Files(files: Base64File[], secretKey: string): EncryptionResult[] {
    return files.map((textFile: Base64File) => this.encryptBase64File(textFile, secretKey));
  }

  static encryptBase64File(file: Base64File, secretKey: string): EncryptionResult {
    return {
      path: file.getPath(),
      content: CryptoAES.encrypt(file.getContent(), secretKey).toString(CryptoJS.format.OpenSSL),
    };
  }
}
