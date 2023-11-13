import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import { Base64File } from '../models/base64-file.class';
import { FileEncryptor } from './file-encryptor.class';

describe('FileEncryptor', () => {
  it('#decryptBase64File should decrypt base64 file', async () => {
    const file = new Base64File('test.txt', 'Hello World!', new Date('2023-11-13'));

    const result = FileEncryptor.encryptBase64File(file, 'secret');
    const decrypted = CryptoAES.decrypt(result.content, 'secret').toString(CryptoJS.enc.Utf8);

    expect(decrypted).toBe('Hello World!');
  });
});
