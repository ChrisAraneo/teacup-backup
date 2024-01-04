import { AccessOptions, FTPResponse } from 'basic-ftp';

export class BasicFtpClientMock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  access(options?: AccessOptions): Promise<FTPResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '',
        });
      }, 200);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadFromDir(localDirPath: string, remoteDirPath?: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }
}
