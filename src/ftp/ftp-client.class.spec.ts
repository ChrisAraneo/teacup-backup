import * as BasicFtp from 'basic-ftp';
import { firstValueFrom } from 'rxjs';

import { BasicFtpClientMock } from './basic-ftp-client.mock';
import { FtpClient } from './ftp-client.class';

let basicClient: BasicFtp.Client;
let ftpClient: FtpClient;

beforeEach(() => {
  basicClient = new BasicFtpClientMock() as unknown as BasicFtp.Client;
  ftpClient = new FtpClient(basicClient);
});

describe('FtpClient', () => {
  it('#uploadDirectory should call access method during upload', async () => {
    jest.spyOn(basicClient, 'access');

    await firstValueFrom(
      ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'teacup-backup'),
    );

    const call = jest.mocked(basicClient.access).mock.calls[0];
    expect(call[0]).toStrictEqual({ host: '1.1.1.1', password: 'password', user: 'admin' });
  });

  it('#uploadDirectory should call uploadFromDir method during upload', async () => {
    jest.spyOn(basicClient, 'uploadFromDir');

    await firstValueFrom(
      ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'teacup-backup'),
    );

    const call = jest.mocked(basicClient.uploadFromDir).mock.calls[0];
    expect(call[0]).toStrictEqual('backup');
    expect(call[1]).toStrictEqual('teacup-backup');
  });

  it('#uploadDirectory should throw error when access rejected', async () => {
    basicClient = new AccessRejectedMock() as unknown as BasicFtp.Client;
    ftpClient = new FtpClient(basicClient);
    let error: unknown;

    try {
      error = await firstValueFrom(
        ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'teacup-backup'),
      );
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toStrictEqual('Rejected error');
  });

  it('#uploadDirectory should throw error when upload failed', async () => {
    basicClient = new UploadFailedMock() as unknown as BasicFtp.Client;
    ftpClient = new FtpClient(basicClient);
    let error: unknown;

    try {
      error = await firstValueFrom(
        ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'teacup-backup'),
      );
    } catch (e: unknown) {
      error = e;
    }

    expect(error).toStrictEqual('Upload failed');
  });
});

class AccessRejectedMock extends BasicFtpClientMock {
  access(): Promise<BasicFtp.FTPResponse> {
    return Promise.reject('Rejected error');
  }
}

class UploadFailedMock extends BasicFtpClientMock {
  uploadFromDir(): Promise<void> {
    return Promise.reject('Upload failed');
  }
}
