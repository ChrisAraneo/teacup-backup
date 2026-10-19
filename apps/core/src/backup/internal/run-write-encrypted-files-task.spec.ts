import { EncryptedFile } from '@chris.araneo/crypto';
import { Base64File } from '@chris.araneo/file-system';
import { mkdtempSync, readdirSync } from 'fs';
import { map } from 'lodash-es';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Task } from '../../types/task';
import { runWriteEncryptedFilesTask } from './run-write-encrypted-files-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const createTemporaryDirectory = (): string =>
  mkdtempSync(join(tmpdir(), 'teacup-backup-'));

const createAlphaFile = (): EncryptedFile =>
  EncryptedFile.fromBase64File(
    new Base64File(
      '/root/alpha.txt',
      'YWxwaGEgY29udGVudA==',
      new Date('2024-03-15T12:00:00.000Z'),
    ),
    'secret',
  );

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runWriteEncryptedFilesTask', () => {
  it('should write the files and report their new names when the backup folder exists', async () => {
    const backupDirectory = createTemporaryDirectory();
    const subject = new ReplaySubject<Task>();

    const writtenFiles = await lastValueFrom(
      runWriteEncryptedFilesTask([createAlphaFile()], backupDirectory, subject),
    );
    const events = await readTaskEvents(subject, 1);

    expect(map(writtenFiles, (file) => file.getFilename())).toEqual([
      'alpha_20240315896cf_txt',
    ]);
    expect(readdirSync(backupDirectory)).toEqual([
      'alpha_20240315896cf_txt.mbe',
    ]);
    expect(events).toEqual([
      {
        kind: 'N',
        value: {
          id: 'WRITE_ENCRYPTED_FILES',
          status: 'SUCCESS',
          message: 'Wrote files: alpha_20240315896cf_txt',
          dependsOn: 'ENCRYPT_FILES',
        },
      },
    ]);
  });

  it('should fail the write task and give no value when the backup folder is missing', async () => {
    const backupDirectory = join(createTemporaryDirectory(), 'missing');
    const subject = new ReplaySubject<Task>();

    const values = await lastValueFrom(
      runWriteEncryptedFilesTask(
        [createAlphaFile()],
        backupDirectory,
        subject,
      ).pipe(toArray()),
    );
    const events = await readTaskEvents(subject, 1);

    expect(values).toEqual([]);
    expect(events).toMatchObject([
      {
        kind: 'E',
        error: { id: 'WRITE_ENCRYPTED_FILES', status: 'ERROR' },
      },
    ]);
    expect(events[0]?.error).toMatchObject({
      message: expect.stringContaining('Error: ENOENT'),
    });
  });
});
