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
      ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'mini-backup'),
    );

    const call = jest.mocked(basicClient.access).mock.calls[0];
    expect(call[0]).toStrictEqual({ host: '1.1.1.1', password: 'password', user: 'admin' });
  });

  it('#uploadDirectory should call uploadFromDir method during upload', async () => {
    jest.spyOn(basicClient, 'uploadFromDir');

    await firstValueFrom(
      ftpClient.uploadDirectory('1.1.1.1', 'admin', 'password', 'backup', 'mini-backup'),
    );

    const call = jest.mocked(basicClient.uploadFromDir).mock.calls[0];
    expect(call[0]).toStrictEqual('backup');
    expect(call[1]).toStrictEqual('mini-backup');
  });
});
