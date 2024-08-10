import * as BasicFtp from 'basic-ftp';
import Path from 'path';
import Prompt from 'prompt-sync';
import {
  EMPTY,
  Observable,
  Subscription,
  catchError,
  forkJoin,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { FileDecryptor } from './crypto/file-decryptor.class';
import { CurrentDirectory } from './file-system/current-directory/current-directory.class';
import { DirectoryCreator } from './file-system/directory-creator/directory-creator.class';
import { DirectoryInfo } from './file-system/directory-info/directory-info.class';
import { FileFinder } from './file-system/file-finder/file-finder.class';
import { Base64FileReader } from './file-system/file-reader/base64-file-reader.class';
import { FileSystem } from './file-system/file-system/file-system.class';
import { Base64FileWriter } from './file-system/file-writer/base64-file-writer.class';
import { FtpClient } from './ftp/ftp-client.class';
import { Base64File } from './models/base64-file.class';
import { Config } from './models/config.type';
import { EncryptedFile } from './models/encrypted-file.class';
import { TextFile } from './models/text-file.class';
import { Logger } from './utils/logger.class';

// Stryker disable all

const prompt = Prompt({
  sigint: false,
});

export class TeacupBackup {
  private fileSystem: FileSystem;
  private fileFinder: FileFinder;
  private currentDirectory: CurrentDirectory;
  private directoryCreator: DirectoryCreator;
  private base64FileReader: Base64FileReader;
  private base64FileWriter: Base64FileWriter;
  private ftpClient: FtpClient;
  private secretKey: string = '';
  private subscription: Subscription;

  constructor(private logger: Logger) {
    this.fileSystem = new FileSystem();
    this.fileFinder = new FileFinder(this.fileSystem, this.logger);
    this.currentDirectory = new CurrentDirectory();
    this.directoryCreator = new DirectoryCreator(this.fileSystem, this.logger);
    this.base64FileReader = new Base64FileReader(this.fileSystem);
    this.base64FileWriter = new Base64FileWriter(this.fileSystem);
    this.ftpClient = new FtpClient(new BasicFtp.Client());
    this.subscription = new Subscription();
  }

  promptUserSecretKey(): void {
    this.logger.info('Secret key (password for encryption):');
    this.secretKey = prompt({ echo: '*' });
  }

  async runBackupFlow(config: Config): Promise<void> {
    const backupDirectory = this.getNormalizedBackupDirectory(config.backupDirectory);

    await this.directoryCreator.createIfDoesntExist(backupDirectory);

    const logFoundFiles = tap((foundFiles: string[]) =>
      this.logger.info('Found files:', foundFiles),
    );
    const encryptFiles = mergeMap((filesInBase64: Base64File[]) =>
      this.encryptBase64Files(filesInBase64),
    );
    const writeFiles = mergeMap((encrypted: EncryptedFile[]) =>
      this.writeEncryptedFiles(encrypted, backupDirectory),
    );
    const logCreatedBackup = tap((files: EncryptedFile[]) =>
      this.logger.info(
        'Created backup:',
        files.map((file) => file.getPath()),
      ),
    );
    const logUploadedBackup = tap((directory: string | null) => {
      if (directory) {
        this.logger.info(`Uploaded directory to FTP server: ${JSON.stringify(directory)}`);
      }
    });
    const uploadFiles = mergeMap(() => {
      if (config.ftp?.enabled) {
        const { host, user, password, directory } = config.ftp;
        const backupDirectory = this.getNormalizedBackupDirectory(config.backupDirectory);

        return this.ftpClient
          .uploadDirectory(host, user, password, backupDirectory, directory)
          .pipe(
            map(() => backupDirectory),
            catchError((error) => {
              this.logger.error(
                JSON.stringify(error, Object.getOwnPropertyNames(error)).replace('\\\\', '\\'),
              );

              return of(null);
            }),
          );
      } else {
        return of(null);
      }
    });

    config.files.forEach((file: string) => {
      this.logger.info('Searching file:', file);

      this.subscription.add(
        this.findFiles(file, config.roots)
          .pipe(
            logFoundFiles,
            mergeMap((foundFiles) =>
              this.readFilesToBase64(foundFiles).pipe(
                encryptFiles,
                writeFiles,
                logCreatedBackup,
                uploadFiles,
                logUploadedBackup,
              ),
            ),
            catchError((error: unknown) => {
              this.logger.info(error?.toString());

              return EMPTY;
            }),
          )
          .subscribe(),
      );
    });
  }

  runRestoreFlow(config: Config): void {
    const backupDirectory = this.getNormalizedBackupDirectory(config.backupDirectory);

    this.directoryCreator.createIfDoesntExist(backupDirectory);

    const filterFilesByExtension = map((files: string[]) =>
      files.filter((file: string) => file.lastIndexOf('.mbe') >= 0),
    );

    const logFilesToDecrypt = tap((files) => this.logger.info('Decrypting files:', files));

    const writeRestoredFiles = mergeMap((decrypted: Base64File[]) =>
      this.writeRestoredFiles(decrypted),
    );

    const logRestoredFiles = tap((writtenRestoredFiles) =>
      this.logger.info('Restored:', writtenRestoredFiles),
    );

    this.subscription.add(
      DirectoryInfo.getContents(backupDirectory, this.fileSystem)
        .pipe(
          filterFilesByExtension,
          logFilesToDecrypt,
          mergeMap((encryptedFiles: string[]) =>
            this.readEncryptedFiles(encryptedFiles, config).pipe(writeRestoredFiles),
          ),
          logRestoredFiles,
          catchError((error: unknown) => {
            this.logger.error(error?.toString());

            return EMPTY;
          }),
        )
        .subscribe(),
    );
  }

  private getNormalizedBackupDirectory(directory: string): string {
    return this.getNormalizedPath(`${this.currentDirectory.getCurrentDirectory()}/${directory}`);
  }

  private getNormalizedPath(path: string): string {
    return Path.normalize(path);
  }

  private findFiles(pattern: string | RegExp, roots: string[] = ['C:\\']): Observable<string[]> {
    return this.fileFinder.findFiles(pattern, roots).pipe(
      tap((results) => {
        this.logger.debug(JSON.stringify(results));
      }),
      map((results) =>
        results
          .filter((item) => item.result?.length > 0)
          .map((item) => item.result)
          .flat(),
      ),
    );
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

  private readEncryptedFiles(files: string[], config: Config): Observable<Base64File[]> {
    return forkJoin(
      files.map((file) => {
        const backupDirectory = this.getNormalizedBackupDirectory(config.backupDirectory);
        const path = this.getNormalizedPath(`${backupDirectory}/${file}`);

        return EncryptedFile.fromEncryptedFile(path);
      }),
    ).pipe(
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
