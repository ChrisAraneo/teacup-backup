import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import { Base64File } from '../models/base64-file.class';
import { EncryptedFile } from '../models/encrypted-file.class';

export class FileDecryptor {
  static decryptBase64Files(files: EncryptedFile[], secretKey: string): Base64File[] {
    return files.map((files: EncryptedFile) => this.decryptBase64File(files, secretKey));
  }

  static decryptBase64File(file: EncryptedFile, secretKey: string): Base64File {
    let decrypted = '';

    try {
      decrypted = CryptoAES.decrypt(file.getContent(), secretKey).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw error;
    }

    if (decrypted) {
      return new Base64File(file.getPath(), decrypted, file.getModifiedDate());
    } else {
      throw Error('Decrypted content is empty!');
    }
  }
}
