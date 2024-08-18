import { filter, map, Observable } from 'rxjs';

import { FileEncryptor } from '../crypto/file-encryptor.class';
import { TextFileReader } from '../file-system/file-reader/text-file-reader.class';
import { FileSystem } from '../file-system/file-system/file-system.class';
import { TextFileWriter } from '../file-system/file-writer/text-file-writer.class';
import { Base64File } from './base64-file.class';
import { TextFile } from './text-file.class';

export class EncryptedFile extends TextFile {
  protected textFileWriter: TextFileWriter;
  protected textFileReader: TextFileReader;

  private constructor(
    protected path: string,
    protected content: string,
    protected modifiedDate: Date,
    protected secretKey: string,
    protected fileSystem: FileSystem = new FileSystem(),
  ) {
    super(path, content, modifiedDate);

    this.textFileWriter = new TextFileWriter(fileSystem);
    this.textFileReader = new TextFileReader(fileSystem);

    if (secretKey) {
      const result = FileEncryptor.encryptBase64File(
        new Base64File(path, content, modifiedDate),
        secretKey,
      );

      this.path = result.path;
      this.content = result.content;
    }
  }

  static fromBase64File(file: Base64File, secretKey: string): EncryptedFile {
    return new EncryptedFile(file.getPath(), file.getContent(), file.getModifiedDate(), secretKey);
  }

  static fromEncryptedFile(
    path: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Observable<EncryptedFile> {
    return new TextFileReader(fileSystem).readFile(path).pipe(
      filter((result) => result instanceof TextFile),
      map(
        (result: TextFile) =>
          new EncryptedFile(
            result.getPath(),
            result.getContent(),
            result.getModifiedDate(),
            '',
            fileSystem,
          ),
      ),
    );
  }

  writeToFile(): Observable<void> {
    return this.textFileWriter.writeFile(this);
  }
}
