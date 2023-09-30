import CryptoAES from "crypto-js/aes";
import { FileFinder } from "./file-finder";
import { Base64File, EncryptedFile } from "./types";
import { FileProcessor } from "./file-processor";
import { FileEncryptor } from "./file-encryptor";

export class MiniBackup {
  async findFiles(
    pattern: string | RegExp,
    roots: string[] = ["C:\\"]
  ): Promise<string[]> {
    return FileFinder.findFiles(pattern, roots);
  }

  async readFilesToBase64(files: string[]): Promise<Base64File[]> {
    return FileProcessor.readFilesToBase64(files);
  }

  async encryptBase64Files(
    files: Base64File[],
    secretKey: string
  ): Promise<EncryptedFile[]> {
    return FileEncryptor.encryptBase64Files(files, secretKey);
  }
}
