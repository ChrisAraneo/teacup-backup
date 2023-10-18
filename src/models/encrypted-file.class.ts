import { FileEncryptor } from "../file-encryptor";
import { FileProcessor } from "../file-processor";
import { TextFileReader } from "../file-system/text-file-reader.class";
import { Base64File } from "./base64-file.class";
import { TextFile } from "./text-file.class";

export class EncryptedFile extends TextFile {
  private constructor(
    protected path: string,
    protected content: string,
    protected modifiedDate: Date,
    protected secretKey?: string
  ) {
    super(path, content, modifiedDate);

    if (secretKey) {
      const result = FileEncryptor.encryptBase64File(
        new Base64File(path, content, modifiedDate),
        secretKey
      );

      this.path = result.path;
      this.content = result.content;
    }
  }

  static async fromEncryptedFile(path: string): Promise<EncryptedFile> {
    const result = await new TextFileReader().readFile(path);  // TODO Move to property

    return new EncryptedFile(
      result.getPath(),
      result.getContent(),
      result.getModifiedDate()
    );
  }

  static async fromBase64File(
    file: Base64File,
    secretKey: string
  ): Promise<EncryptedFile> {
    return new EncryptedFile(
      file.getPath(),
      file.getContent(),
      file.getModifiedDate(),
      secretKey
    );
  }

  async writeToFile(): Promise<void> {
    return FileProcessor.writeTextFile(this);
  }
}
