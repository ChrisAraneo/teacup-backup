import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';

import { Base64File } from '../models/base64-file.class';
import { FileEncryptor } from './file-encryptor.class';

describe('FileEncryptor', () => {
  it('#encryptBase64File should encrypt base64 file', async () => {
    const file = new Base64File('test.txt', 'Hello World!', new Date('2023-11-13'));

    const result = FileEncryptor.encryptBase64File(file, 'secret');
    const decrypted = CryptoAES.decrypt(result.content, 'secret').toString(CryptoJS.enc.Utf8);

    expect(decrypted).toBe('Hello World!');
  });

  it('#encryptBase64Files should encrypt base64 file', async () => {
    const files = [
      new Base64File('test1.txt', 'First file', new Date('2024-10-10')),
      new Base64File('test2.txt', 'Second file', new Date('2024-11-11')),
    ];

    const result = FileEncryptor.encryptBase64Files(files, 'secret');
    const decrypted = [
      CryptoAES.decrypt(result[0].content, 'secret').toString(CryptoJS.enc.Utf8),
      CryptoAES.decrypt(result[1].content, 'secret').toString(CryptoJS.enc.Utf8),
    ];

    expect(decrypted).toStrictEqual(['First file', 'Second file']);
  });

  it('#encryptBase64File should throw error when provided incorrect file', async () => {
    expect(() => FileEncryptor.encryptBase64File(null, 'secret')).toThrowError();
  });
});
