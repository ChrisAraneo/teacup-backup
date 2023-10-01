import { FileEncryptor } from "../file-encryptor";
import { Base64File } from "../types";
import { File } from "./file.class";

export class EncryptedFile extends File<string> {
  constructor(
    protected path: string,
    protected content: string,
    private secretKey: string
  ) {
    super("", "");

    FileEncryptor.encryptBase64File({ path, content }, this.secretKey).then(
      (result) => {
        this.path = result.path;
        this.content = result.content;
      }
    );
  }

  static async fromBase64File(
    file: Base64File,
    secretKey: string
  ): Promise<EncryptedFile> {
    return new EncryptedFile(file.path, file.content, secretKey);
  }
}
