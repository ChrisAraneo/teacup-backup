import { FileEncryptor } from '../crypto/file-encryptor.class';
import { TextFileReader } from '../file-system/text-file-reader.class';
import { TextFileWriter } from '../file-system/text-file-writer.class';
import { Base64File } from './base64-file.class';
import { TextFile } from './text-file.class';
import { FileSystem } from '../file-system/file-system.class';

export class EncryptedFile extends TextFile {
  protected textFileReader: TextFileReader;

  private constructor(
    protected path: string,
    protected content: string,
    protected modifiedDate: Date,
    protected secretKey?: string,
    protected fileSystem: FileSystem = new FileSystem(),
  ) {
    super(path, content, modifiedDate);

    if (!this.textFileReader) {
      this.textFileReader = new TextFileReader(fileSystem);
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

  static async fromBase64File(file: Base64File, secretKey: string): Promise<EncryptedFile> {
    return new EncryptedFile(file.getPath(), file.getContent(), file.getModifiedDate(), secretKey);
  }

  static async fromEncryptedFile(
    path: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Promise<EncryptedFile> {
    const result = await new TextFileReader(fileSystem).readFile(path); // TODO Refactor

    return new EncryptedFile(result.getPath(), result.getContent(), result.getModifiedDate());
  }

  async writeToFile(fileSystem: FileSystem = new FileSystem()): Promise<void> {
    if (!this.textFileWriter) {
      this.textFileWriter = new TextFileWriter(fileSystem);
    }

    return this.textFileWriter.writeFile(this);
  }
}
