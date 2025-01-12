import { EncryptedFile, FileDecryptor } from '@chris.araneo/crypto';
import {
  Base64File,
  Base64FileReader,
  Base64FileWriter,
  CurrentDirectory,
  DirectoryCreator,
  DirectoryInfo,
  FileFinder,
  FileSystem,
  TextFile,
} from '@chris.araneo/file-system';
import { FtpClient } from '@chris.araneo/ftp';
import { Logger } from '@chris.araneo/logger';
import * as BasicFtp from 'basic-ftp';
import Path from 'path';
import {
  catchError,
  EMPTY,
  first,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  Subscription,
  tap,
} from 'rxjs';

import { Config } from './models/config.type';

// Stryker disable all

// TODO Refactor

interface Task {
  task: string; // TODO Name
  message: string;
  status: 'success' | 'error';
}

export class TeacupBackup {
  private fileSystem: FileSystem;
  private fileFinder: FileFinder;
  private currentDirectory: CurrentDirectory;
  private directoryCreator: DirectoryCreator;
  private base64FileReader: Base64FileReader;
  private base64FileWriter: Base64FileWriter;
  private ftpClient: FtpClient;
  private subscription: Subscription;

  constructor(
    private readonly logger: Logger,
    private readonly secretKey: string,
  ) {
    this.fileSystem = new FileSystem();
    this.fileFinder = new FileFinder(this.fileSystem, this.logger);
    this.currentDirectory = new CurrentDirectory();
    this.directoryCreator = new DirectoryCreator(this.fileSystem, this.logger);
    this.base64FileReader = new Base64FileReader(this.fileSystem);
    this.base64FileWriter = new Base64FileWriter(this.fileSystem);
    this.ftpClient = new FtpClient(new BasicFtp.Client());
    this.subscription = new Subscription();
  }

  runBackupFlow(config: Config): Observable<Task> {
    const subject = new Subject<Task>();

    const backupDirectory = this.getNormalizedBackupDirectory(
      config.backupDirectory,
    );

    const encryptFiles = mergeMap((filesInBase64: Base64File[]) =>
      this.encryptBase64Files(filesInBase64).pipe(
        tap((files) =>
          subject.next({
            task: 'ENCRYPT_FILES',
            message: `Encrypted files: ${files.map((file) => file.getFilename())}`,
            status: 'success',
          }),
        ),
        catchError((error: unknown) => {
          subject.error({
            task: 'ENCRYPT_FILES',
            message: error.toString(),
            status: 'error',
          });

          return EMPTY;
        }),
      ),
    );

    const writeFiles = mergeMap((encrypted: EncryptedFile[]) =>
      this.writeEncryptedFiles(encrypted, backupDirectory).pipe(
        tap((files) =>
          subject.next({
            task: 'WRITE_ENCRYPTED_FILES',
            message: `Wrote files: ${files.map((file) => file.getFilename())}`,
            status: 'success',
          }),
        ),
        catchError((error: unknown) => {
          subject.error({
            task: 'WRITE_ENCRYPTED_FILES',
            message: error.toString(),
            status: 'error',
          });

          return EMPTY;
        }),
      ),
    );

    const uploadFiles = mergeMap(() => {
      if (config.ftp?.enabled) {
        const { host, user, password, directory } = config.ftp;
        const backupDirectory = this.getNormalizedBackupDirectory(
          config.backupDirectory,
        );

        return this.ftpClient
          .uploadDirectory(host, user, password, backupDirectory, directory)
          .pipe(
            map(() => backupDirectory),
            tap((backupDirectory) => {
              if (backupDirectory !== null) {
                subject.next({
                  task: 'FTP_UPLOAD',
                  message:
                    'Successfully uploaded directory: ' + backupDirectory,
                  status: 'success',
                });
              }
            }),
            catchError((error) => {
              subject.error({
                task: 'FTP_UPLOAD',
                message: JSON.stringify(
                  error,
                  Object.getOwnPropertyNames(error),
                ).replace('\\\\', '\\'),
                status: 'error',
              });
              subject.unsubscribe();

              return of(null);
            }),
          );
      } else {
        return of(null);
      }
    });

    const createBackupDirectory = from(
      this.directoryCreator.createIfDoesntExist(backupDirectory),
    ).pipe(
      first(),
      tap(() =>
        subject.next({
          task: 'CREATE_DIRECTORY',
          message: 'Backup directory is ready: ' + backupDirectory,
          status: 'success',
        }),
      ),
      catchError((error: unknown) => {
        subject.error({
          task: 'CREATE_DIRECTORY',
          message: error.toString(),
          status: 'error',
        });

        return EMPTY;
      }),
    );

    const subscription = createBackupDirectory
      .pipe(
        mergeMap(() => {
          const fileFlows = config.files.map((file: string) => {
            return this.findFiles(file, config.roots).pipe(
              tap((foundFiles) => {
                subject.next({
                  task: 'FIND_FILES',
                  message: `Found files: ${foundFiles.join(', ')}`,
                  status: 'success',
                });
              }),
              mergeMap((foundFiles) =>
                this.readFilesToBase64(foundFiles).pipe(
                  encryptFiles,
                  writeFiles,
                  uploadFiles,
                ),
              ),
              catchError((error: unknown) => {
                subject.error({
                  task: 'UNKNOWN', // TODO Refactor
                  message: error?.toString() || '',
                  status: 'error',
                });
                subject.unsubscribe();

                return EMPTY;
              }),
            );
          });

          return forkJoin(fileFlows).pipe(
            tap(() => {
              subject.next({
                task: 'FINISH',
                message: 'Finished all tasks for all files',
                status: 'success',
              });
              subject.complete();
              subject.unsubscribe();
              subscription.unsubscribe();
            }),
          );
        }),
      )
      .subscribe();

    return subject.asObservable();
  }

  runRestoreFlow(config: Config): void {
    const backupDirectory = this.getNormalizedBackupDirectory(
      config.backupDirectory,
    );

    this.directoryCreator.createIfDoesntExist(backupDirectory);

    const filterFilesByExtension = map((files: string[]) =>
      files.filter((file: string) => file.lastIndexOf('.mbe') >= 0),
    );

    const logFilesToDecrypt = tap((files) =>
      this.logger.info('Decrypting files:', files),
    );

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
            this.readEncryptedFiles(encryptedFiles, config).pipe(
              writeRestoredFiles,
            ),
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
    return this.getNormalizedPath(
      `${this.currentDirectory.getCurrentDirectory()}/${directory}`,
    );
  }

  private getNormalizedPath(path: string): string {
    return Path.normalize(path);
  }

  private findFiles(
    pattern: string | RegExp,
    roots: string[] = ['C:\\'],
  ): Observable<string[]> {
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
    return this.base64FileReader
      .readFiles(files)
      .pipe(
        map(
          (files) =>
            files.filter((file) => file instanceof Base64File) as Base64File[],
        ),
      );
  }

  private encryptBase64Files(files: Base64File[]): Observable<EncryptedFile[]> {
    return forkJoin(
      files.map((item) =>
        of(EncryptedFile.fromBase64File(item, this.secretKey)),
      ),
    );
  }

  private writeEncryptedFiles(
    files: EncryptedFile[],
    backupDirectory: string,
  ): Observable<EncryptedFile[]> {
    this.updateFilePathsToEncrypted(files, backupDirectory);

    return forkJoin(files.map((file) => file.writeToFile())).pipe(
      map(() => files),
    );
  }

  private readEncryptedFiles(
    files: string[],
    config: Config,
  ): Observable<Base64File[]> {
    return forkJoin(
      files.map((file) => {
        const backupDirectory = this.getNormalizedBackupDirectory(
          config.backupDirectory,
        );
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

  private updateFilePathsToEncrypted(
    files: TextFile[],
    backupDirectory: string,
  ): void {
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
      const updatedExtension = currentFilename.substring(
        lastIndexOfUnderscore + 1,
      );
      const secondLastIndexOfUnderscore = currentFilename.lastIndexOf(
        '_',
        lastIndexOfUnderscore - 1,
      );
      const updatedFilename = currentFilename.substring(
        0,
        secondLastIndexOfUnderscore,
      );

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
        currentFilename +
        '_restored_' +
        modifiedDateFormattedString +
        fileHashValueShort;

      file.setFilename(updatedFilename, currentExtension);
    });
  }
}
