import { FileDecryptor } from './crypto/file-decryptor.class';
import { Base64FileReader } from './file-system/base64-file-reader.class';
import { Base64FileWriter } from './file-system/base64-file-writer.class';
import { ConfigLoader } from './file-system/config-loader';
import { FileFinder } from './file-system/file-finder';
import { Base64File } from './models/base64-file.class';
import { EncryptedFile } from './models/encrypted-file.class';
import { TextFile } from './models/text-file.class';
import Prompt from 'prompt-sync';
import fs from 'fs';

const prompt = Prompt({
  sigint: false,
});

export class MiniBackup {
  private base64FileReader: Base64FileReader;
  private secretKey: string = '';

  constructor() {
    this.base64FileReader = new Base64FileReader(fs);
  }

  promptUserSecretKey(): void {
    console.log('Secret key (password for encryption):');
    this.secretKey = prompt({ echo: '*' });
  }

  async findFiles(pattern: string | RegExp, roots: string[] = ['C:\\']): Promise<string[]> {
    return FileFinder.findFiles(pattern, roots);
  }

  async readFilesToBase64(files: string[]): Promise<Base64File[]> {
    return this.base64FileReader.readFiles(files);
  }

  async encryptBase64Files(files: Base64File[]): Promise<EncryptedFile[]> {
    return Promise.all(files.map((item) => EncryptedFile.fromBase64File(item, this.secretKey)));
  }

  async writeEncryptedFiles(
    files: EncryptedFile[],
    backupDirectory: string,
  ): Promise<EncryptedFile[]> {
    this.updateFilePathsToEncrypted(files, backupDirectory);

    await Promise.all(files.map((file) => file.writeToFile()));

    return files;
  }

  async readEncryptedFiles(paths: string[]): Promise<Base64File[]> {
    const encryptedFiles: EncryptedFile[] = await Promise.all(
      paths.map((path) => EncryptedFile.fromEncryptedFile(path)),
    );

    const decryptedFiles: Base64File[] = FileDecryptor.decryptBase64Files(
      encryptedFiles,
      this.secretKey,
    );

    this.updateFilePathsToDecrypted(decryptedFiles);

    return decryptedFiles;
  }

  async writeRestoredFiles(files: Base64File[]): Promise<string[]> {
    this.updateFilePathsToRestored(files);

    await new Base64FileWriter(fs).writeFiles(files); // TODO Property

    return files.map((file) => file.getPath());
  }

  async readConfigFile(): Promise<object> {
    return ConfigLoader.readConfigFile();
  }

  private updateFilePathsToEncrypted(files: TextFile[], backupDirectory: string): void {
    files.forEach((file) => {
      const currentFilename = file.getFilename();
      const currentExtension = file.getExtension();
      const modifiedDateFormattedString = file
        .getModifiedDate()
        .toISOString()
        .split('T')[0]
        .replace('-', '')
        .replace('-', '');
      const fileHashValueShort = file.getHashValue().substring(0, 5);
      const updatedFilename =
        currentFilename +
        '_' +
        modifiedDateFormattedString +
        fileHashValueShort +
        '_' +
        currentExtension;

      file.setPath(`${backupDirectory}/${updatedFilename + '.mbe'}`);
    });
  }

  private updateFilePathsToDecrypted(encryptedFiles: TextFile[]): void {
    encryptedFiles.forEach((file) => {
      const currentFilename = file.getFilename();
      const lastIndexOfUnderscore = currentFilename.lastIndexOf('_');
      const updatedExtension = currentFilename.substring(lastIndexOfUnderscore + 1);
      const secondLastIndexOfUnderscore = currentFilename.lastIndexOf(
        '_',
        lastIndexOfUnderscore - 1,
      );
      const updatedFilename = currentFilename.substring(0, secondLastIndexOfUnderscore);

      file.setFilename(updatedFilename, updatedExtension);
    });
  }

  private updateFilePathsToRestored(decryptedFiles: TextFile[]): void {
    decryptedFiles.forEach((file) => {
      const currentFilename = file.getFilename();
      const currentExtension = file.getExtension();
      const modifiedDateFormattedString = file
        .getModifiedDate()
        .toISOString()
        .split('T')[0]
        .replace('-', '')
        .replace('-', '');
      const fileHashValueShort = file.getHashValue().substring(0, 5);
      const updatedFilename =
        currentFilename + '_restored_' + modifiedDateFormattedString + fileHashValueShort;

      file.setFilename(updatedFilename, currentExtension);
    });
  }
}
