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
  JsonFile,
  JsonFileReader,
  TextFile,
  TextFileWriter,
} from '@chris.araneo/file-system';
import { ReadFileError } from '@chris.araneo/file-system/dist/src/file-reader/read-file-error.type';
import { FtpClient } from '@chris.araneo/ftp';
import { Logger } from '@chris.araneo/logger';
import * as BasicFtp from 'basic-ftp';
import Path from 'path';
import {
  catchError,
  delay,
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
  take,
  tap,
} from 'rxjs';

import { Config } from './models/config.interface';
import { DEFAULT_CONFIG } from './models/default-config.const';
import { Task } from './models/task.interface';
import { TaskId } from './models/task-id.enum';
import { TaskStatus } from './models/task-status.enum';

// Stryker disable all

// TODO Refactor

export class TeacupBackup {
  private readonly START_TASK_DELAY_MS = 20;
  private readonly CREATE_DIRECTORY_TASK_DELAY_MS = 20;

  private fileSystem: FileSystem;
  private fileFinder: FileFinder;
  private currentDirectory: CurrentDirectory;
  private directoryCreator: DirectoryCreator;
  private base64FileReader: Base64FileReader;
  private base64FileWriter: Base64FileWriter;
  private jsonFileReader: JsonFileReader;
  private textFileWriter: TextFileWriter; // TODO Refactor to JsonFileWriter
  private ftpClient: FtpClient;
  private subscription: Subscription;

  constructor(private readonly logger: Logger) {
    this.fileSystem = new FileSystem();
    this.fileFinder = new FileFinder(this.fileSystem, this.logger);
    this.currentDirectory = new CurrentDirectory();
    this.directoryCreator = new DirectoryCreator(this.fileSystem, this.logger);
    this.base64FileReader = new Base64FileReader(this.fileSystem);
    this.base64FileWriter = new Base64FileWriter(this.fileSystem);
    this.textFileWriter = new TextFileWriter(this.fileSystem);
    this.jsonFileReader = new JsonFileReader(this.fileSystem);
    this.ftpClient = new FtpClient(new BasicFtp.Client());
    this.subscription = new Subscription();
    this.currentDirectory = new CurrentDirectory();
  }

  writeDefaultConfigWhenDoesntExist(): Observable<void> {
    const directory =
      this.currentDirectory.getExtendedInfo()['root'] ||
      this.currentDirectory.getCurrentDirectory();

    return DirectoryInfo.getContents(directory, this.fileSystem).pipe(
      take(1),
      mergeMap((contents) => {
        if (!contents.find((item) => item === 'config.json')) {
          return this.textFileWriter.writeFile(
            new TextFile(
              `${directory}/config.json`,
              DEFAULT_CONFIG,
              new Date(),
            ),
          );
        }

        return of(undefined);
      }),
    );
  }

  readConfig(): Observable<JsonFile | ReadFileError> {
    const directory =
      this.currentDirectory.getExtendedInfo()['root'] ||
      this.currentDirectory.getCurrentDirectory();

    return this.jsonFileReader.readFile(`${directory}/config.json`);
  }

  runBackupFlow(config: Config): Observable<Task> {
    const subject = new Subject<Task>();

    const backupDirectory = this.getNormalizedBackupDirectory(
      config.backupDirectory,
    );

    const encryptFiles = mergeMap((filesInBase64: Base64File[]) =>
      this.encryptBase64Files(filesInBase64, config.secret).pipe(
        tap((files) =>
          this.emitTask(
            subject,
            TaskId.EncryptFiles,
            TaskStatus.Success,
            `Encrypted files: ${files.map((file) => file.getFilename())}`,
          ),
        ),
        catchError((error: unknown) => {
          this.emitTask(
            subject,
            TaskId.EncryptFiles,
            TaskStatus.Error,
            error.toString(),
          );

          return EMPTY;
        }),
      ),
    );

    const writeFiles = mergeMap((encrypted: EncryptedFile[]) =>
      this.writeEncryptedFiles(encrypted, backupDirectory).pipe(
        tap((files) =>
          this.emitTask(
            subject,
            TaskId.WriteEncryptedFiles,
            TaskStatus.Success,
            `Wrote files: ${files.map((file) => file.getFilename())}`,
          ),
        ),
        catchError((error: unknown) => {
          this.emitTask(
            subject,
            TaskId.WriteEncryptedFiles,
            TaskStatus.Error,
            error.toString(),
          );

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
                this.emitTask(
                  subject,
                  TaskId.UploadFtp,
                  TaskStatus.Success,
                  'Successfully uploaded directory: ' + backupDirectory,
                );
              }
            }),
            catchError((error) => {
              this.emitTask(
                subject,
                TaskId.UploadFtp,
                TaskStatus.Error,
                JSON.stringify(
                  error,
                  Object.getOwnPropertyNames(error),
                ).replace('\\\\', '\\'),
              );

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
        this.emitTask(
          subject,
          TaskId.CreateDirectory,
          TaskStatus.Success,
          'Backup directory is ready: ' + backupDirectory,
        ),
      ),
      catchError((error: unknown) => {
        this.emitTask(
          subject,
          TaskId.CreateDirectory,
          TaskStatus.Error,
          error.toString(),
        );

        return EMPTY;
      }),
    );

    of([])
      .pipe(
        delay(this.START_TASK_DELAY_MS),
        tap(() => {
          this.emitTask(
            subject,
            TaskId.Start,
            TaskStatus.Success,
            'Starting backup',
          );
        }),
        delay(this.CREATE_DIRECTORY_TASK_DELAY_MS),
        mergeMap(() =>
          createBackupDirectory.pipe(
            mergeMap(() => {
              const fileFlows = config.files.map((file: string) => {
                return this.findFiles(file, config.roots).pipe(
                  tap((foundFiles) => {
                    this.emitTask(
                      subject,
                      TaskId.FindFiles,
                      TaskStatus.Success,
                      `Found files: ${foundFiles.join(', ')}`,
                    );
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
                      task: 'UNKNOWN', // TODO
                      message: error?.toString() || '',
                      status: 'error',
                    });

                    return EMPTY;
                  }),
                );
              });

              return forkJoin(fileFlows).pipe(
                tap(() => {
                  this.emitTask(
                    subject,
                    TaskId.Finalize,
                    TaskStatus.Success,
                    'Finished all tasks for all files',
                  );
                }),
              );
            }),
          ),
        ),
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

  private encryptBase64Files(
    files: Base64File[],
    secret: string,
  ): Observable<EncryptedFile[]> {
    return forkJoin(
      files.map((item) => of(EncryptedFile.fromBase64File(item, secret))),
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
          config.secret,
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

  private emitTask(
    subject: Subject<Task>,
    id: TaskId,
    status: TaskStatus,
    message: string,
  ): void {
    if (subject.closed) {
      throw Error('Subject closed');
    } else if (status === TaskStatus.Success) {
      subject.next({
        id: id,
        status: status,
        message: message,
      });

      if (id === TaskId.Finalize) {
        subject.complete();
      }
    } else {
      subject.error({
        id: id,
        status: status,
        message: message,
      });
    }
  }
}
