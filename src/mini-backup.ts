import { FileEncryptor } from "./file-encryptor";
import { FileFinder } from "./file-finder";
import { FileProcessor } from "./file-processor";
import { Base64File } from "./models/base64-file.class";
import { EncryptedFile } from "./models/encrypted-file.class";
import { TextFile } from "./models/text-file.class";

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
    return Promise.all(
      files.map((item) => EncryptedFile.fromBase64File(item, secretKey))
    );
  }

  async writeEncryptedFiles(files: EncryptedFile[]): Promise<EncryptedFile[]> {
    this.updateFilePathsToEncrypted(files);

    await Promise.all(files.map((file) => file.writeToFile()));

    return files;
  }

  async readEncryptedFiles(
    paths: string[],
    secretKey: string
  ): Promise<Base64File[]> {
    const encryptedFiles: EncryptedFile[] = await Promise.all(
      paths.map((path) => EncryptedFile.fromEncryptedFile(path))
    );

    const decryptedFiles: Base64File[] = FileEncryptor.decryptBase64Files(
      encryptedFiles,
      secretKey
    );

    this.updateFilePathsToDecrypted(decryptedFiles);

    return decryptedFiles;
  }

  async writeRestoredFiles(files: Base64File[]): Promise<string[]> {
    this.updateFilePathsToRestored(files);

    await FileProcessor.writeFilesFromBase64(files);

    return files.map((file) => file.getPath());
  }

  private updateFilePathsToEncrypted(files: TextFile[]): void {
    files.forEach((file) => {
      const currentFilename = file.getFilename();
      const currentExtension = file.getExtension();

      file.setFilename(
        currentFilename + "_encrypted_" + currentExtension,
        "txt"
      );
    });
  }

  private updateFilePathsToDecrypted(encryptedFiles: TextFile[]): void {
    encryptedFiles.forEach((file) => {
      const currentFilename = file.getFilename();
      const ecryptedSubstringIndex = currentFilename.lastIndexOf("_encrypted_");
      const updatedExtension = currentFilename.substring(
        ecryptedSubstringIndex + "_encrypted_".length
      );
      const updatedFilename = currentFilename.replace(
        "_encrypted_" + updatedExtension,
        "_decrypted_"
      );

      console.log(
        "updateFilePathsToDecrypted",
        currentFilename,
        updatedFilename,
        updatedExtension
      );

      file.setFilename(updatedFilename, updatedExtension);
    });
  }

  private updateFilePathsToRestored(decryptedFiles: TextFile[]): void {
    decryptedFiles.forEach((file) => {
      const currentFilename = file.getFilename();
      const currentExtension = file.getExtension();
      const updatedFilename = currentFilename.replace(
        "_decrypted_",
        "_restored_"
      );

      console.log(
        "updateFilePathsToRestored",
        currentFilename,
        currentExtension,
        updatedFilename
      );

      file.setFilename(updatedFilename, currentExtension);
    });
  }
}
