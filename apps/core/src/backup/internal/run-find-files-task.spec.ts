import { map } from 'lodash-es';
import {
  lastValueFrom,
  materialize,
  type Observable,
  of,
  ReplaySubject,
  take,
  toArray,
} from 'rxjs';

import type { Task } from '../../types/task';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { runFindFilesTask } from './run-find-files-task';

interface TaskEvent {
  kind: string;
  value?: Task;
  error?: unknown;
}

const createServices = (found: string[]): TeacupBackupServices =>
  ({
    fileFinder: {
      findFiles: (pattern: string, roots: string[]) =>
        of([
          {
            success: true,
            pattern,
            root: roots[0],
            result: found,
            message: null,
          },
        ]),
    },
    logger: { debug: () => 'ignored' },
  }) as unknown as TeacupBackupServices;

const readTaskEvents = (
  tasks: Observable<Task>,
  count: number,
): Promise<TaskEvent[]> =>
  lastValueFrom(tasks.pipe(materialize(), take(count), toArray())).then(
    (notifications) =>
      map(notifications, ({ kind, value, error }) => ({ kind, value, error })),
  );

describe('runFindFilesTask', () => {
  it('should give the found paths and report them when the pattern matches', async () => {
    const subject = new ReplaySubject<Task>();

    const paths = await lastValueFrom(
      runFindFilesTask(
        'alpha',
        ['/root'],
        subject,
        createServices(['/root/alpha.txt', '/root/alpha.md']),
      ),
    );
    const events = await readTaskEvents(subject, 1);

    expect(paths).toEqual(['/root/alpha.txt', '/root/alpha.md']);
    expect(events).toEqual([
      {
        kind: 'N',
        value: {
          id: 'FIND_FILES',
          status: 'SUCCESS',
          message: 'Found files: /root/alpha.txt, /root/alpha.md',
          dependsOn: 'CREATE_DIRECTORY',
        },
      },
    ]);
  });

  it('should report no files when nothing matches the pattern', async () => {
    const subject = new ReplaySubject<Task>();

    const paths = await lastValueFrom(
      runFindFilesTask('alpha', ['/root'], subject, createServices([])),
    );
    const events = await readTaskEvents(subject, 1);

    expect(paths).toEqual([]);
    expect(events[0]?.value?.message).toBe('Found files: ');
  });
});
