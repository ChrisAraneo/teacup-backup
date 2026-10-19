import {
  Base64File,
  type Base64FileReader,
  ReadFileResultStatus,
} from '@chris.araneo/file-system';
import type { ReadFileError } from '@chris.araneo/file-system/dist/src/file-reader/read-file-error.type';
import { lastValueFrom, of } from 'rxjs';

import { runEffect } from '../../run-effect';
import { readBase64Files } from './read-base64-files';

const ALPHA_FILE = new Base64File(
  '/root/alpha.txt',
  'YWxwaGEgY29udGVudA==',
  new Date('2024-03-15T12:00:00.000Z'),
);

const READ_ERROR: ReadFileError = {
  status: ReadFileResultStatus.Error,
  message: 'Error while reading file metadata (/root/ghost.txt)',
};

const createBase64FileReader = (readPaths: string[][]): Base64FileReader =>
  ({
    readFiles: (paths: string[]) =>
      of(runEffect([ALPHA_FILE, READ_ERROR], () => readPaths.push(paths))),
  }) as unknown as Base64FileReader;

describe('readBase64Files', () => {
  it('should keep only the files that could be read when some reads fail', async () => {
    const readPaths: string[][] = [];

    const files = await lastValueFrom(
      readBase64Files(
        ['/root/alpha.txt', '/root/ghost.txt'],
        createBase64FileReader(readPaths),
      ),
    );

    expect(files).toEqual([ALPHA_FILE]);
    expect(files[0]).toBe(ALPHA_FILE);
    expect(readPaths).toEqual([['/root/alpha.txt', '/root/ghost.txt']]);
  });
});
