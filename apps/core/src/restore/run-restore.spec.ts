import { EncryptedFile } from '@chris.araneo/crypto';
import {
  Base64File,
  Base64FileWriter,
  FileSystem,
} from '@chris.araneo/file-system';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  first,
  firstValueFrom,
  lastValueFrom,
  ReplaySubject,
  Subscription,
} from 'rxjs';

import { chain } from '../chain';
import { runEffect } from '../run-effect';
import type { Config } from '../types/config';
import type { TeacupBackupServices } from '../types/teacup-backup-services';
import { runRestore } from './run-restore';

interface LogCall {
  level: string;
  message: string;
  meta: unknown[];
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const ALPHA_ENCRYPTED_FILENAME = 'alpha_20240315896cf_txt.mbe';

const ALPHA_RESTORED_FILENAME = 'alpha_restored_20240315896cf.txt';

const CONFIG: Config = {
  roots: [],
  files: [],
  mode: 'restore',
  backupDirectory: 'backup',
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
  secret: 'secret',
};

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createServices = (
  workDirectory: string,
  createdDirectories: string[],
  calls: ReplaySubject<LogCall>,
): TeacupBackupServices =>
  chain(new FileSystem())
    .thru(
      (fileSystem) =>
        ({
          fileSystem,
          currentDirectory: { getCurrentDirectory: () => workDirectory },
          directoryCreator: {
            createIfDoesntExist: (directory: string) =>
              runEffect(Promise.resolve(), () =>
                createdDirectories.push(directory),
              ),
          },
          base64FileWriter: new Base64FileWriter(fileSystem),
          logger: {
            info: (message: string, ...meta: unknown[]) =>
              calls.next({ level: 'info', message, meta }),
            error: (message: string, ...meta: unknown[]) =>
              calls.next({ level: 'error', message, meta }),
          },
        }) as unknown as TeacupBackupServices,
    )
    .value();

const writeEncryptedAlpha = (backupDirectory: string): Promise<void> =>
  chain(
    EncryptedFile.fromBase64File(
      new Base64File(
        join(backupDirectory, 'alpha.txt'),
        'YWxwaGEgY29udGVudA==',
        MODIFIED_DATE,
      ),
      'secret',
    ),
  )
    .thru((file) =>
      runEffect(file, (value) =>
        value.setPath(join(backupDirectory, ALPHA_ENCRYPTED_FILENAME)),
      ),
    )
    .thru((file) => lastValueFrom(file.writeToFile()))
    .value()
    .then(() =>
      utimesSync(
        join(backupDirectory, ALPHA_ENCRYPTED_FILENAME),
        MODIFIED_DATE,
        MODIFIED_DATE,
      ),
    );

describe('runRestore', () => {
  it('should create the folder, restore the backup files and log both steps when the folder holds backups', async () => {
    const workDirectory = createTemporaryDirectory();
    const backupDirectory = join(workDirectory, 'backup');
    mkdirSync(backupDirectory);
    await writeEncryptedAlpha(backupDirectory);
    const createdDirectories: string[] = [];
    const calls = new ReplaySubject<LogCall>();

    const subscription = runRestore(
      CONFIG,
      createServices(workDirectory, createdDirectories, calls),
    );
    const restored = await firstValueFrom(
      calls.pipe(first((call) => call.message === 'Restored:')),
    );

    expect(subscription).toBeInstanceOf(Subscription);
    expect(createdDirectories).toEqual([backupDirectory]);
    expect(restored.meta).toEqual([
      [join(backupDirectory, ALPHA_RESTORED_FILENAME)],
    ]);
    expect(
      readFileSync(join(backupDirectory, ALPHA_RESTORED_FILENAME), 'utf-8'),
    ).toBe('alpha content');
  });

  it('should log the error when the backup folder is a file', async () => {
    const workDirectory = createTemporaryDirectory();
    writeFileSync(join(workDirectory, 'backup'), 'not a folder');
    const calls = new ReplaySubject<LogCall>();

    runRestore(CONFIG, createServices(workDirectory, [], calls));
    const errorCall = await firstValueFrom(
      calls.pipe(first((call) => call.level === 'error')),
    );

    expect(errorCall.message).toContain('ENOTDIR');
    expect(errorCall.meta).toEqual([]);
  });
});
