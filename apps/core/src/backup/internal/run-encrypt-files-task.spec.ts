import { Base64File } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Task } from '../../types/task';
import { runEncryptFilesTask } from './run-encrypt-files-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const MODIFIED_DATE = new Date('2024-03-15T12:00:00.000Z');

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runEncryptFilesTask', () => {
  it('should give the encrypted files and report their names when it gets files', async () => {
    const subject = new ReplaySubject<Task>();

    const encryptedFiles = await lastValueFrom(
      runEncryptFilesTask(
        [
          new Base64File(
            '/root/alpha.txt',
            'YWxwaGEgY29udGVudA==',
            MODIFIED_DATE,
          ),
          new Base64File('/root/README', 'cmVhZG1lIGNvbnRlbnQ=', MODIFIED_DATE),
        ],
        'secret',
        subject,
      ),
    );
    const events = await readTaskEvents(subject, 1);

    expect(map(encryptedFiles, (file) => file.getPath())).toEqual([
      '/root/alpha.txt',
      '/root/README',
    ]);
    expect(events).toEqual([
      {
        kind: 'N',
        value: {
          id: 'ENCRYPT_FILES',
          status: 'SUCCESS',
          message: 'Encrypted files: alpha,README',
          dependsOn: 'FIND_FILES',
        },
      },
    ]);
  });

  it('should report nothing and give no value when it gets no files', async () => {
    const subject = new ReplaySubject<Task>();

    const events = await lastValueFrom(
      runEncryptFilesTask([], 'secret', subject).pipe(toArray()),
    );
    subject.complete();
    const taskEvents = await readTaskEvents(subject, 1);

    expect(events).toEqual([]);
    expect(taskEvents).toEqual([{ kind: 'C' }]);
  });
});
