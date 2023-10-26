import { FileEncryptor } from '../crypto/file-encryptor.class';
import { TextFileReader } from '../file-system/text-file-reader.class';
import { TextFileWriter } from '../file-system/text-file-writer.class';
import { Base64File } from './base64-file.class';
import { TextFile } from './text-file.class';
import fs from 'fs';

export class EncryptedFile extends TextFile {
  private static textFileReader: TextFileReader;
  private textFileWriter: TextFileWriter;

  private constructor(
    protected path: string,
    protected content: string,
    protected modifiedDate: Date,
    protected secretKey?: string,
  ) {
    super(path, content, modifiedDate);

    if (!EncryptedFile.textFileReader) {
      EncryptedFile.textFileReader = new TextFileReader(fs);
    }

    if (secretKey) {
      const result = FileEncryptor.encryptBase64File(
        new Base64File(path, content, modifiedDate),
        secretKey,
      );

      this.path = result.path;
      this.content = result.content;
    }
  }

  static async fromEncryptedFile(path: string): Promise<EncryptedFile> {
    if (!EncryptedFile.textFileReader) {
      EncryptedFile.textFileReader = new TextFileReader(fs);
    }

    const result = await EncryptedFile.textFileReader.readFile(path);

    return new EncryptedFile(result.getPath(), result.getContent(), result.getModifiedDate());
  }

  static async fromBase64File(file: Base64File, secretKey: string): Promise<EncryptedFile> {
    return new EncryptedFile(file.getPath(), file.getContent(), file.getModifiedDate(), secretKey);
  }

  async writeToFile(): Promise<void> {
    if (!this.textFileWriter) {
      this.textFileWriter = new TextFileWriter(fs);
    }

    return this.textFileWriter.writeFile(this);
  }
}
