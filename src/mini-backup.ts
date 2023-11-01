import { FileDecryptor } from './crypto/file-decryptor.class';
import { Base64FileReader } from './file-system/base64-file-reader.class';
import { Base64FileWriter } from './file-system/base64-file-writer.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { FileFinder } from './file-system/file-finder';
import { Base64File } from './models/base64-file.class';
import { EncryptedFile } from './models/encrypted-file.class';
import { TextFile } from './models/text-file.class';
import { FileSystem } from './file-system/file-system.class';
import Prompt from 'prompt-sync';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { Config } from './models/config.type';
import { DirectoryInfo } from './file-system/directory-info.class';
import Path from 'path';
import { Logger } from './utils/logger.class';

const prompt = Prompt({
  sigint: false,
});

export class MiniBackup {
  private logger: Logger;
  private fileSystem: FileSystem;
  private currentDirectoryProvider: CurrentDirectoryProvider;
  private configLoader: ConfigLoader;
  private base64FileReader: Base64FileReader;
  private base64FileWriter: Base64FileWriter;
  private secretKey: string = '';

  constructor() {
    this.logger = new Logger();
    this.fileSystem = new FileSystem();
    this.currentDirectoryProvider = new CurrentDirectoryProvider();
    this.configLoader = new ConfigLoader(this.currentDirectoryProvider, this.fileSystem);
    this.base64FileReader = new Base64FileReader(this.fileSystem);
    this.base64FileWriter = new Base64FileWriter(this.fileSystem);
  }

  promptUserSecretKey(): void {
    this.logger.info('Secret key (password for encryption):');
    this.secretKey = prompt({ echo: '*' });
  }

  async readConfigFile(): Promise<object> {
    return this.configLoader.readConfigFile();
  }

  async runBackupFlow(config: Config): Promise<void> {
    const backupDirectory = Path.normalize(
      `${this.currentDirectoryProvider.getCurrentDirectory()}/${config.backupDirectory}`,
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    config.files.forEach(async (file) => {
      this.logger.info('Searching file:', file.filename);

      const foundFiles = await this.findFiles(file.filename, config.roots);

      this.logger.info('Found files:', foundFiles);

      const filesInBase64 = await this.readFilesToBase64(foundFiles);
      const encrypted = await this.encryptBase64Files(filesInBase64);
      const writtenEncryptedFiles = await this.writeEncryptedFiles(encrypted, backupDirectory);

      this.logger.info(
        'Created backup:',
        writtenEncryptedFiles.map((file) => file.getPath()),
      );
    });
  }

  async runRestoreFlow(config: Config): Promise<void> {
    const backupDirectory = Path.normalize(
      `${this.currentDirectoryProvider.getCurrentDirectory()}/${config.backupDirectory}`,
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    const encryptedFiles: string[] = (
      await DirectoryInfo.getContents(backupDirectory, this.fileSystem)
    ).filter((file) => file.lastIndexOf('.mbe') >= 0);

    this.logger.info('Decrypting files:', encryptedFiles);

    const decrypted = await this.readEncryptedFiles(encryptedFiles);
    const writtenRestoredFiles = await this.writeRestoredFiles(decrypted);

    this.logger.info('Restored:', writtenRestoredFiles);
  }

  private createDirectoryIfDoesntExist(directory: string): void {
    // TODO Move to another class?
    if (!this.fileSystem.existsSync(directory)) {
      this.fileSystem.mkdirSync(directory);
    }
  }

  private async findFiles(pattern: string | RegExp, roots: string[] = ['C:\\']): Promise<string[]> {
    return FileFinder.findFiles(pattern, roots);
  }

  private async readFilesToBase64(files: string[]): Promise<Base64File[]> {
    return this.base64FileReader.readFiles(files);
  }

  private async encryptBase64Files(files: Base64File[]): Promise<EncryptedFile[]> {
    return Promise.all(files.map((item) => EncryptedFile.fromBase64File(item, this.secretKey)));
  }

  private async writeEncryptedFiles(
    files: EncryptedFile[],
    backupDirectory: string,
  ): Promise<EncryptedFile[]> {
    this.updateFilePathsToEncrypted(files, backupDirectory);

    await Promise.all(files.map((file) => file.writeToFile()));

    return files;
  }

  private async readEncryptedFiles(paths: string[]): Promise<Base64File[]> {
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

  private async writeRestoredFiles(files: Base64File[]): Promise<string[]> {
    this.updateFilePathsToRestored(files);

    await this.base64FileWriter.writeFiles(files);

    return files.map((file) => file.getPath());
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
