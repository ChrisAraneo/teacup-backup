import { Base64File, type Base64FileReader } from '@chris.araneo/file-system';
import { filter } from 'lodash-es';
import { map, type Observable } from 'rxjs';
import { isMatching, P } from 'ts-pattern';

const { instanceOf } = P;

export const readBase64Files = (
  paths: string[],
  base64FileReader: Base64FileReader,
): Observable<Base64File[]> =>
  base64FileReader
    .readFiles(paths)
    .pipe(map((files) => filter(files, isMatching(instanceOf(Base64File)))));
