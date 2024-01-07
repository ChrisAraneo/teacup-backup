import * as BasicFtp from 'basic-ftp';
import { Observable, from } from 'rxjs';

export class FtpClient {
  constructor(private client: BasicFtp.Client) {}

  uploadDirectory(
    host: string,
    user: string,
    password: string,
    backupDirectory: string,
    remoteDirectory: string,
  ): Observable<void> {
    return from(
      new Promise<void>((resolve, reject) => {
        this.client
          .access({
            host: host,
            user: user,
            password: password,
          })
          .then(() => {
            this.client
              .uploadFromDir(backupDirectory, remoteDirectory)
              .then(() => {
                resolve();
              })
              .catch((error: unknown) => {
                reject(error);
              });
          })
          .catch((error: unknown) => {
            reject(error);
          });
      }),
    );
  }
}
