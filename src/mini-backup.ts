import { FileEncryptor } from "./file-encryptor";
import { FileFinder } from "./file-finder";
import { FileProcessor } from "./file-processor";
import { Base64File, EncryptedFile } from "./types";

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

  async writeEncryptedFiles(files: EncryptedFile[]): Promise<EncryptedFile[]> {
    const filesWithChangedNames = this.updateFilePathsToEncrypted(files);

    await FileProcessor.writeTextFiles(filesWithChangedNames);

    return filesWithChangedNames;
  }

  private updateFilePathsToEncrypted(files: Base64File[]) {
    return files.map((file) => {
      const parts = file.path.split(".");

      if (parts.length >= 2) {
        const extension = parts[parts.length - 1];
        const updatedName = parts[parts.length - 2] + "_encrypted_" + extension;

        let updatedPath = "";
        for (let i = 0; i < parts.length - 2; ++i) {
          updatedPath += parts[i];
        }
        updatedPath += updatedPath + updatedName + ".txt";

        return {
          ...file,
          path: updatedPath,
        };
      } else {
        return {
          ...file,
          path: file.path + "_encrypted.txt",
        };
      }
    });
  }
}
