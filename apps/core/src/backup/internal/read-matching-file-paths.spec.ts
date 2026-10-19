import type { FindFileResult } from '@chris.araneo/file-system/dist/src/file-finder/find-file-result.type';
import { lastValueFrom, of } from 'rxjs';

import { runEffect } from '../../run-effect';
import type { TeacupBackupServices } from '../../types/teacup-backup-services';
import { readMatchingFilePaths } from './read-matching-file-paths';

interface FindCall {
  pattern: string | RegExp;
  roots: string[];
}

const FIND_FILE_RESULTS: FindFileResult[] = [
  {
    success: true,
    pattern: 'alpha',
    root: '/root',
    result: ['/root/alpha.txt'],
    message: null,
  },
  {
    success: true,
    pattern: 'alpha',
    root: '/other',
    result: [],
    message: null,
  },
];

const createServices = (
  findCalls: FindCall[],
  debugMessages: string[],
): TeacupBackupServices =>
  ({
    fileFinder: {
      findFiles: (pattern: string | RegExp, roots: string[]) =>
        of(
          runEffect(FIND_FILE_RESULTS, () =>
            findCalls.push({ pattern, roots }),
          ),
        ),
    },
    logger: {
      debug: (message: string) => debugMessages.push(message),
    },
  }) as unknown as TeacupBackupServices;

describe('readMatchingFilePaths', () => {
  it('should give the found paths and log the raw results when it searches the roots', async () => {
    const findCalls: FindCall[] = [];
    const debugMessages: string[] = [];

    const paths = await lastValueFrom(
      readMatchingFilePaths(
        'alpha',
        ['/root', '/other'],
        createServices(findCalls, debugMessages),
      ),
    );

    expect(paths).toEqual(['/root/alpha.txt']);
    expect(findCalls).toEqual([
      { pattern: 'alpha', roots: ['/root', '/other'] },
    ]);
    expect(debugMessages).toEqual([JSON.stringify(FIND_FILE_RESULTS)]);
  });

  it('should search the C drive when the roots are missing', async () => {
    const findCalls: FindCall[] = [];

    await lastValueFrom(
      readMatchingFilePaths('alpha', undefined, createServices(findCalls, [])),
    );

    expect(findCalls).toEqual([{ pattern: 'alpha', roots: ['C:\\'] }]);
  });
});
