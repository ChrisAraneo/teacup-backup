import { Base64File, type Base64FileWriter } from '@chris.araneo/file-system';
import { lastValueFrom, of } from 'rxjs';

import { runEffect } from '../../run-effect';
import { writeRestoredFiles } from './write-restored-files';

const createBase64FileWriter = (
  writtenFiles: Base64File[][],
): Base64FileWriter =>
  ({
    writeFiles: (files: Base64File[]) =>
      of(runEffect(undefined, () => writtenFiles.push(files))),
  }) as unknown as Base64FileWriter;

describe('writeRestoredFiles', () => {
  it('should write the files under their restored names and give their paths when it gets files', async () => {
    const writtenFiles: Base64File[][] = [];
    const file = new Base64File(
      '/backup/alpha.txt',
      'YWxwaGEgY29udGVudA==',
      new Date('2024-03-15T12:00:00.000Z'),
    );

    const paths = await lastValueFrom(
      writeRestoredFiles([file], createBase64FileWriter(writtenFiles)),
    );

    expect(paths).toEqual(['/backup/alpha_restored_20240315896cf.txt']);
    expect(writtenFiles).toEqual([[file]]);
    expect(writtenFiles[0]?.[0]).toBe(file);
  });
});
