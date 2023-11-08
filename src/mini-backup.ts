import Path from 'path';
import Prompt from 'prompt-sync';
import { Observable, filter, forkJoin, map, mergeMap, of, tap } from 'rxjs';
import { FileDecryptor } from './crypto/file-decryptor.class';
import { Base64FileReader } from './file-system/base64-file-reader.class';
import { Base64FileWriter } from './file-system/base64-file-writer.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { DirectoryInfo } from './file-system/directory-info.class';
import { FileFinder } from './file-system/file-finder.class';
import { FileSystem } from './file-system/file-system.class';
import { Base64File } from './models/base64-file.class';
import { Config } from './models/config.type';
import { EncryptedFile } from './models/encrypted-file.class';
import { TextFile } from './models/text-file.class';
import { Logger } from './utils/logger.class';

const prompt = Prompt({
  sigint: false,
});

export class MiniBackup {
  private logger: Logger;
  private fileSystem: FileSystem;
  private fileFinder: FileFinder;
  private currentDirectoryProvider: CurrentDirectoryProvider;
  private configLoader: ConfigLoader;
  private base64FileReader: Base64FileReader;
  private base64FileWriter: Base64FileWriter;
  private secretKey: string = '';

  constructor() {
    this.logger = new Logger();
    this.fileSystem = new FileSystem();
    this.fileFinder = new FileFinder();
    this.currentDirectoryProvider = new CurrentDirectoryProvider();
    this.configLoader = new ConfigLoader(this.currentDirectoryProvider, this.fileSystem);
    this.base64FileReader = new Base64FileReader(this.fileSystem);
    this.base64FileWriter = new Base64FileWriter(this.fileSystem);
  }

  promptUserSecretKey(): void {
    this.logger.info('Secret key (password for encryption):');
    this.secretKey = prompt({ echo: '*' });
  }

  readConfigFile(): Observable<object> {
    return this.configLoader.readConfigFile();
  }

  runBackupFlow(config: Config): void {
    const backupDirectory = Path.normalize(
      `${this.currentDirectoryProvider.getCurrentDirectory()}/${config.backupDirectory}`,
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    config.files.forEach((file) => {
      this.logger.info('Searching file:', file.filename);

      this.findFiles(file.filename, config.roots).subscribe((foundFiles) => {
        this.logger.info('Found files:', foundFiles);

        this.readFilesToBase64(foundFiles).pipe(
          mergeMap((filesInBase64) => this.encryptBase64Files(filesInBase64)),
          mergeMap((encrypted) => this.writeEncryptedFiles(encrypted, backupDirectory)),
          tap((files) => {
            this.logger.info(
              'Created backup:',
              files.map((file) => file.getPath()),
            );
          }),
        );
      });
    });
  }

  runRestoreFlow(config: Config): void {
    const backupDirectory = Path.normalize(
      `${this.currentDirectoryProvider.getCurrentDirectory()}/${config.backupDirectory}`,
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    DirectoryInfo.getContents(backupDirectory, this.fileSystem)
      .pipe(
        filter((file) => file.lastIndexOf('.mbe') >= 0),
        tap((files) => {
          this.logger.info('Decrypting files:', files);
        }),
        mergeMap((encryptedFiles) =>
          this.readEncryptedFiles(encryptedFiles).pipe(
            mergeMap((decrypted) => this.writeRestoredFiles(decrypted)),
          ),
        ),
        tap((writtenRestoredFiles) => {
          this.logger.info('Restored:', writtenRestoredFiles);
        }),
      )
      .subscribe();
  }

  private createDirectoryIfDoesntExist(directory: string): void {
    // TODO Move to another class?
    if (!this.fileSystem.existsSync(directory)) {
      this.logger.debug(`Creating backup directory: '${directory}'`);
      this.fileSystem.mkdirSync(
        directory,
        { recursive: true },
        (error: NodeJS.ErrnoException, path?: string) => {
          if (error) {
            throw Error("Can't create backup directory");
          } else if (path) {
            this.logger.debug('Created backup directory');
          }
        },
      );
    }
  }

  private findFiles(pattern: string | RegExp, roots: string[] = ['C:\\']): Observable<string[]> {
    return this.fileFinder.findFiles(pattern, roots);
  }

  private readFilesToBase64(files: string[]): Observable<Base64File[]> {
    return this.base64FileReader.readFiles(files);
  }

  private encryptBase64Files(files: Base64File[]): Observable<EncryptedFile[]> {
    return forkJoin(files.map((item) => of(EncryptedFile.fromBase64File(item, this.secretKey))));
  }

  private writeEncryptedFiles(
    files: EncryptedFile[],
    backupDirectory: string,
  ): Observable<EncryptedFile[]> {
    this.updateFilePathsToEncrypted(files, backupDirectory);

    return forkJoin(files.map((file) => file.writeToFile())).pipe(map(() => files));
  }

  private readEncryptedFiles(paths: string[]): Observable<Base64File[]> {
    return forkJoin(paths.map((path) => EncryptedFile.fromEncryptedFile(path))).pipe(
      map((encryptedFiles) => {
        const decryptedFiles: Base64File[] = FileDecryptor.decryptBase64Files(
          encryptedFiles,
          this.secretKey,
        );

        this.updateFilePathsToDecrypted(decryptedFiles);

        return decryptedFiles;
      }),
    );
  }

  private writeRestoredFiles(files: Base64File[]): Observable<string[]> {
    this.updateFilePathsToRestored(files);

    return this.base64FileWriter
      .writeFiles(files)
      .pipe(map(() => files.map((file) => file.getPath())));
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
