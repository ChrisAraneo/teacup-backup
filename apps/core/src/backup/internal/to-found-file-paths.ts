import type { FindFileResult } from '@chris.araneo/file-system/dist/src/file-finder/find-file-result.type';
import { filter, flatMap, size } from 'lodash-es';

export const toFoundFilePaths = (results: FindFileResult[]): string[] =>
  flatMap(
    filter(results, (result) => size(result.result) > 0),
    (result) => result.result,
  );
