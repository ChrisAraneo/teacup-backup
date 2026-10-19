import { EncryptedFile } from '@chris.araneo/crypto';
import {
  Base64File,
  type CurrentDirectory,
  type FileFinder,
} from '@chris.araneo/file-system';
import type { FindFileResult } from '@chris.araneo/file-system/dist/src/file-finder/find-file-result.type';
import type { Logger } from '@chris.araneo/logger';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { keys, map, noop, slice, sortBy } from 'lodash-es';
import { tmpdir } from 'os';
import { join, relative } from 'path';
import {
  first,
  firstValueFrom,
  lastValueFrom,
  materialize,
  type Observable,
  of,
  ReplaySubject,
  take,
  timer,
  toArray,
} from 'rxjs';

import { chain } from './chain';
import { runEffect } from './run-effect';
import { TeacupBackup } from './teacup-backup';
import type { Config } from './types/config';
import type { Task } from './types/task';

interface LogCall {
  level: string;
  message: string;
  meta: unknown[];
}

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

interface TeacupBackupInternals {
  services: { fileFinder: FileFinder; currentDirectory: CurrentDirectory };
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const SECRET = 'secret';

const ALPHA_CONTENT = 'alpha content';

const ALPHA_BASE64 = 'YWxwaGEgY29udGVudA==';

const ALPHA_ENCRYPTED_FILENAME = 'alpha_20240315896cf_txt.mbe';

const ALPHA_RESTORED_FILENAME = 'alpha_restored_20240315896cf.txt';

const SETTLE_TIME_MS = 100;

const FTP_TEST_TIMEOUT_MS = 20_000;

const DEFAULT_CONFIG_TEXT =
  '{"roots":["C:\\\\","D:\\\\"],"files":[],"mode":"backup","backupDirectory":"./backup","interval":3600000,"log-level":"debug","ftp":{"enabled":false,"host":"","user":"","password":"","directory":"backup"}}';

const TASK_KEYS = ['id', 'status', 'message', 'dependsOn'];

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createLogger = (calls: ReplaySubject<LogCall>): Logger =>
  ({
    debug: (message: string, ...meta: unknown[]) =>
      calls.next({ level: 'debug', message, meta }),
    info: (message: string, ...meta: unknown[]) =>
      calls.next({ level: 'info', message, meta }),
    warn: (message: string, ...meta: unknown[]) =>
      calls.next({ level: 'warn', message, meta }),
    error: (message: string, ...meta: unknown[]) =>
      calls.next({ level: 'error', message, meta }),
  }) as unknown as Logger;

const createConfig = (backupDirectory: string, roots: string[]): Config => ({
  roots,
  files: ['alpha.txt'],
  mode: 'backup',
  backupDirectory: relative(process.cwd(), backupDirectory),
  interval: 1,
  'log-level': 'debug',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
  secret: SECRET,
});

const createFindFileResult = (
  pattern: string,
  root: string,
  result: string[],
): FindFileResult => ({ success: true, pattern, root, result, message: null });

const createFileFinder = (
  createResults: (pattern: string, root: string) => FindFileResult[],
): FileFinder =>
  ({
    findFiles: (pattern: string, roots: string[]) =>
      of(createResults(pattern, roots[0] ?? '')),
  }) as unknown as FileFinder;

const createTeacupBackup = (
  logger: Logger,
  fileFinder: FileFinder,
): TeacupBackup =>
  runEffect(
    new TeacupBackup(logger),
    (teacupBackup) =>
      ((teacupBackup as unknown as TeacupBackupInternals).services.fileFinder =
        fileFinder),
  );

const createCurrentDirectory = (root: string): CurrentDirectory =>
  ({
    getExtendedInfo: () => ({ root }),
    getCurrentDirectory: () => process.cwd(),
  }) as unknown as CurrentDirectory;

const createTeacupBackupWithRoot = (root: string): TeacupBackup =>
  runEffect(
    new TeacupBackup(createLogger(new ReplaySubject())),
    (teacupBackup) =>
      ((
        teacupBackup as unknown as TeacupBackupInternals
      ).services.currentDirectory = createCurrentDirectory(root)),
  );

const writeDatedFile = (path: string, content: string): string =>
  chain(path)
    .thru((filePath) =>
      runEffect(filePath, () => writeFileSync(filePath, content)),
    )
    .thru((filePath) =>
      runEffect(filePath, () =>
        utimesSync(filePath, MODIFIED_DATE, MODIFIED_DATE),
      ),
    )
    .value();

const writeEncryptedAlpha = (backupDirectory: string): Promise<void> =>
  chain(
    EncryptedFile.fromBase64File(
      new Base64File(
        join(backupDirectory, 'alpha.txt'),
        ALPHA_BASE64,
        MODIFIED_DATE,
      ),
      SECRET,
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

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

const readSettledLogCalls = (
  calls: ReplaySubject<LogCall>,
): Promise<LogCall[]> =>
  firstValueFrom(timer(SETTLE_TIME_MS))
    .then(() => runEffect(calls, (value) => value.complete()))
    .then((value) => lastValueFrom(value.pipe(toArray())));

describe('TeacupBackup', () => {
  it('should write the default config when the config file is missing', async () => {
    const root = createTemporaryDirectory();
    const teacupBackup = createTeacupBackupWithRoot(root);

    const values = await lastValueFrom(
      teacupBackup.writeDefaultConfigWhenDoesntExist().pipe(toArray()),
    );

    expect(values).toEqual([undefined]);
    expect(readFileSync(join(root, 'config.json'), 'utf-8')).toBe(
      DEFAULT_CONFIG_TEXT,
    );
  });

  it('should keep the config file when the config file already exists', async () => {
    const root = createTemporaryDirectory();
    writeFileSync(join(root, 'config.json'), '{"mode":"restore"}');
    const teacupBackup = createTeacupBackupWithRoot(root);

    const values = await lastValueFrom(
      teacupBackup.writeDefaultConfigWhenDoesntExist().pipe(toArray()),
    );

    expect(values).toEqual([undefined]);
    expect(readFileSync(join(root, 'config.json'), 'utf-8')).toBe(
      '{"mode":"restore"}',
    );
  });

  it('should fail when the config folder is missing', async () => {
    const root = join(createTemporaryDirectory(), 'missing');
    const teacupBackup = createTeacupBackupWithRoot(root);

    const error = await lastValueFrom(
      teacupBackup.writeDefaultConfigWhenDoesntExist(),
    ).then(noop, (reason: unknown) => reason);

    expect(error).toMatchObject({ code: 'ENOENT', syscall: 'scandir' });
  });

  it('should write the config as JSON when it gets a config', async () => {
    const root = createTemporaryDirectory();
    const teacupBackup = createTeacupBackupWithRoot(root);

    const values = await lastValueFrom(
      teacupBackup
        .writeConfig(createConfig(join(root, 'backup'), ['D:\\']))
        .pipe(toArray()),
    );

    expect(values).toEqual([undefined]);
    expect(
      JSON.parse(readFileSync(join(root, 'config.json'), 'utf-8')),
    ).toEqual(createConfig(join(root, 'backup'), ['D:\\']));
  });

  it('should write the text as it is when it gets a text', async () => {
    const root = createTemporaryDirectory();
    const teacupBackup = createTeacupBackupWithRoot(root);

    await lastValueFrom(teacupBackup.writeConfig('plain text'));

    expect(readFileSync(join(root, 'config.json'), 'utf-8')).toBe('plain text');
  });

  it('should read the config when the config file holds JSON', async () => {
    const root = createTemporaryDirectory();
    writeFileSync(
      join(root, 'config.json'),
      '{"mode":"restore","files":["notes.txt"]}',
    );
    const teacupBackup = createTeacupBackupWithRoot(root);

    const file = await firstValueFrom(teacupBackup.readConfig());

    expect(file).toMatchObject({
      path: `${root}/config.json`,
      content: { mode: 'restore', files: ['notes.txt'] },
    });
  });

  it('should give a read error when the config file is missing', async () => {
    const root = createTemporaryDirectory();
    const teacupBackup = createTeacupBackupWithRoot(root);

    const result = await firstValueFrom(teacupBackup.readConfig());

    expect(result).toEqual({
      status: 'error',
      message: expect.stringContaining(
        `Error while reading file metadata (${root}/config.json)`,
      ),
    });
  });

  it('should report the start, the folder and no found files when nothing matches the pattern', async () => {
    const directory = createTemporaryDirectory();
    const root = join(directory, 'root');
    mkdirSync(root);
    const teacupBackup = new TeacupBackup(createLogger(new ReplaySubject()));

    const events = await readTaskEvents(
      teacupBackup.runBackupFlow({
        ...createConfig(join(directory, 'backup'), [root]),
        files: ['nothing-matches-this'],
      }),
      3,
    );

    expect(events).toEqual([
      {
        kind: 'N',
        value: { id: 'START', status: 'SUCCESS', message: 'Starting backup' },
      },
      {
        kind: 'N',
        value: {
          id: 'CREATE_DIRECTORY',
          status: 'SUCCESS',
          message: `Backup directory is ready: ${join(directory, 'backup')}`,
          dependsOn: 'START',
        },
      },
      {
        kind: 'N',
        value: {
          id: 'FIND_FILES',
          status: 'SUCCESS',
          message: 'Found files: ',
          dependsOn: 'CREATE_DIRECTORY',
        },
      },
    ]);
    expect(map(events, (event) => keys(event.value))).toEqual([
      TASK_KEYS,
      TASK_KEYS,
      TASK_KEYS,
    ]);
  });

  it('should report only the start and the folder when no pattern is configured', async () => {
    const directory = createTemporaryDirectory();
    const teacupBackup = new TeacupBackup(createLogger(new ReplaySubject()));

    const events = await readTaskEvents(
      teacupBackup.runBackupFlow({
        ...createConfig(join(directory, 'backup'), [directory]),
        files: [],
      }),
      2,
    );

    expect(map(events, (event) => event.value?.id)).toEqual([
      'START',
      'CREATE_DIRECTORY',
    ]);
  });

  it('should back up every found file and then finish when the pattern matches', async () => {
    const directory = createTemporaryDirectory();
    const root = join(directory, 'root');
    mkdirSync(root);
    const alpha = writeDatedFile(join(root, 'alpha.txt'), ALPHA_CONTENT);
    const readme = writeDatedFile(join(root, 'README'), 'readme content');
    const calls = new ReplaySubject<LogCall>();
    const teacupBackup = createTeacupBackup(
      createLogger(calls),
      createFileFinder((pattern, searchRoot) => [
        createFindFileResult(pattern, searchRoot, [alpha, readme]),
        createFindFileResult(pattern, searchRoot, []),
      ]),
    );

    const events = await readTaskEvents(
      teacupBackup.runBackupFlow(
        createConfig(join(directory, 'backup'), [root]),
      ),
      7,
    );
    const debugCall = await firstValueFrom(
      calls.pipe(first((call) => call.message.startsWith('[{'))),
    );

    expect(events).toEqual([
      {
        kind: 'N',
        value: { id: 'START', status: 'SUCCESS', message: 'Starting backup' },
      },
      {
        kind: 'N',
        value: {
          id: 'CREATE_DIRECTORY',
          status: 'SUCCESS',
          message: `Backup directory is ready: ${join(directory, 'backup')}`,
          dependsOn: 'START',
        },
      },
      {
        kind: 'N',
        value: {
          id: 'FIND_FILES',
          status: 'SUCCESS',
          message: `Found files: ${alpha}, ${readme}`,
          dependsOn: 'CREATE_DIRECTORY',
        },
      },
      {
        kind: 'N',
        value: {
          id: 'ENCRYPT_FILES',
          status: 'SUCCESS',
          message: 'Encrypted files: alpha,README',
          dependsOn: 'FIND_FILES',
        },
      },
      {
        kind: 'N',
        value: {
          id: 'WRITE_ENCRYPTED_FILES',
          status: 'SUCCESS',
          message:
            'Wrote files: alpha_20240315896cf_txt,README_202403154164f_null',
          dependsOn: 'ENCRYPT_FILES',
        },
      },
      {
        kind: 'N',
        value: {
          id: 'FINALIZE',
          status: 'SUCCESS',
          message: 'Finished all tasks for all files',
        },
      },
      { kind: 'C' },
    ]);
    expect(keys(events[5]?.value)).toEqual(TASK_KEYS);
    expect(readdirSync(join(directory, 'backup'))).toEqual([
      ALPHA_ENCRYPTED_FILENAME,
      'README_202403154164f_null.mbe',
    ]);
    expect(debugCall).toEqual({
      level: 'debug',
      message: JSON.stringify([
        createFindFileResult('alpha.txt', root, [alpha, readme]),
        createFindFileResult('alpha.txt', root, []),
      ]),
      meta: [],
    });
  });

  it('should back up the files of each pattern when it gets two patterns', async () => {
    const directory = createTemporaryDirectory();
    const root = join(directory, 'root');
    mkdirSync(root);
    const alpha = writeDatedFile(join(root, 'alpha.txt'), ALPHA_CONTENT);
    const beta = writeDatedFile(join(root, 'beta.txt'), 'beta content');
    const teacupBackup = createTeacupBackup(
      createLogger(new ReplaySubject()),
      createFileFinder((pattern, searchRoot) => [
        createFindFileResult(pattern, searchRoot, [
          join(root, `${pattern}.txt`),
        ]),
      ]),
    );

    const events = await readTaskEvents(
      teacupBackup.runBackupFlow({
        ...createConfig(join(directory, 'backup'), [root]),
        files: ['alpha', 'beta'],
      }),
      10,
    );

    expect(map(events, (event) => [event.kind, event.value?.id])).toEqual([
      ['N', 'START'],
      ['N', 'CREATE_DIRECTORY'],
      ['N', 'FIND_FILES'],
      ['N', 'FIND_FILES'],
      ['N', 'ENCRYPT_FILES'],
      ['N', 'ENCRYPT_FILES'],
      ['N', 'WRITE_ENCRYPTED_FILES'],
      ['N', 'WRITE_ENCRYPTED_FILES'],
      ['N', 'FINALIZE'],
      ['C', undefined],
    ]);
    expect(
      sortBy(
        map(slice(events, 2, 8), (event) => event.value?.message),
        (message) => message,
      ),
    ).toEqual([
      'Encrypted files: alpha',
      'Encrypted files: beta',
      `Found files: ${alpha}`,
      `Found files: ${beta}`,
      'Wrote files: alpha_20240315896cf_txt',
      'Wrote files: beta_202403159e875_txt',
    ]);
  });

  it('should write the content unencrypted when the config has no secret', async () => {
    const directory = createTemporaryDirectory();
    const root = join(directory, 'root');
    mkdirSync(root);
    const alpha = writeDatedFile(join(root, 'alpha.txt'), ALPHA_CONTENT);
    const teacupBackup = createTeacupBackup(
      createLogger(new ReplaySubject()),
      createFileFinder((pattern, searchRoot) => [
        createFindFileResult(pattern, searchRoot, [alpha]),
      ]),
    );

    await readTaskEvents(
      teacupBackup.runBackupFlow({
        ...createConfig(join(directory, 'backup'), [root]),
        secret: undefined,
      }),
      6,
    );

    expect(
      readFileSync(
        join(directory, 'backup', ALPHA_ENCRYPTED_FILENAME),
        'utf-8',
      ),
    ).toBe(ALPHA_BASE64);
  });

  it('should stop after the found files when a found file cannot be read', async () => {
    const directory = createTemporaryDirectory();
    const root = join(directory, 'root');
    mkdirSync(root);
    const teacupBackup = createTeacupBackup(
      createLogger(new ReplaySubject()),
      createFileFinder((pattern, searchRoot) => [
        createFindFileResult(pattern, searchRoot, [join(root, 'ghost.txt')]),
      ]),
    );

    const events = await readTaskEvents(
      teacupBackup.runBackupFlow(
        createConfig(join(directory, 'backup'), [root]),
      ),
      3,
    );

    expect(map(events, (event) => event.value?.id)).toEqual([
      'START',
      'CREATE_DIRECTORY',
      'FIND_FILES',
    ]);
    expect(readdirSync(join(directory, 'backup'))).toEqual([]);
  });

  it(
    'should fail the upload task when the FTP server refuses the connection',
    async () => {
      const directory = createTemporaryDirectory();
      const root = join(directory, 'root');
      mkdirSync(root);
      const alpha = writeDatedFile(join(root, 'alpha.txt'), ALPHA_CONTENT);
      const teacupBackup = createTeacupBackup(
        createLogger(new ReplaySubject()),
        createFileFinder((pattern, searchRoot) => [
          createFindFileResult(pattern, searchRoot, [alpha]),
        ]),
      );

      const events = await readTaskEvents(
        teacupBackup.runBackupFlow({
          ...createConfig(join(directory, 'backup'), [root]),
          ftp: {
            enabled: true,
            host: '127.0.0.1',
            user: 'user',
            password: 'password',
            directory: 'remote',
          },
        }),
        6,
      );

      expect(map(events, (event) => event.value?.id)).toEqual([
        'START',
        'CREATE_DIRECTORY',
        'FIND_FILES',
        'ENCRYPT_FILES',
        'WRITE_ENCRYPTED_FILES',
        undefined,
      ]);
      expect(events[5]).toMatchObject({
        kind: 'E',
        error: {
          id: 'UPLOAD_FTP',
          status: 'ERROR',
          message: expect.stringContaining('ECONNREFUSED'),
        },
      });
      expect(keys(events[5]?.error)).toEqual(['id', 'status', 'message']);
    },
    FTP_TEST_TIMEOUT_MS,
  );

  it('should restore the backup files when the folder holds encrypted files', async () => {
    const backupDirectory = join(createTemporaryDirectory(), 'backup');
    mkdirSync(backupDirectory);
    await writeEncryptedAlpha(backupDirectory);
    writeDatedFile(join(backupDirectory, 'notes.txt'), 'not a backup');
    const calls = new ReplaySubject<LogCall>();
    const teacupBackup = new TeacupBackup(createLogger(calls));

    const result = teacupBackup.runRestoreFlow(
      createConfig(backupDirectory, []),
    );
    const restored = await firstValueFrom(
      calls.pipe(first((call) => call.message === 'Restored:')),
    );

    expect(result).toBeUndefined();
    expect(restored.meta).toEqual([
      [join(backupDirectory, ALPHA_RESTORED_FILENAME)],
    ]);
    expect(
      readFileSync(join(backupDirectory, ALPHA_RESTORED_FILENAME), 'utf-8'),
    ).toBe(ALPHA_CONTENT);
    expect(readdirSync(backupDirectory)).toEqual([
      ALPHA_ENCRYPTED_FILENAME,
      ALPHA_RESTORED_FILENAME,
      'notes.txt',
    ]);
  });

  it('should only list the files when the folder holds no encrypted file', async () => {
    const backupDirectory = join(createTemporaryDirectory(), 'backup');
    mkdirSync(backupDirectory);
    writeDatedFile(join(backupDirectory, 'notes.txt'), 'not a backup');
    const calls = new ReplaySubject<LogCall>();
    const teacupBackup = new TeacupBackup(createLogger(calls));

    teacupBackup.runRestoreFlow(createConfig(backupDirectory, []));
    const logCalls = await readSettledLogCalls(calls);

    expect(logCalls).toEqual([
      { level: 'debug', message: 'Directory already exists', meta: [] },
      { level: 'info', message: 'Decrypting files:', meta: [[]] },
    ]);
  });

  it('should log the error when the backup folder is a file', async () => {
    const backupDirectory = join(createTemporaryDirectory(), 'backup');
    writeDatedFile(backupDirectory, 'not a folder');
    const calls = new ReplaySubject<LogCall>();
    const teacupBackup = new TeacupBackup(createLogger(calls));

    teacupBackup.runRestoreFlow(createConfig(backupDirectory, []));
    const errorCall = await firstValueFrom(
      calls.pipe(first((call) => call.level === 'error')),
    );

    expect(errorCall.message).toContain('ENOTDIR');
    expect(errorCall.meta).toEqual([]);
  });
});
