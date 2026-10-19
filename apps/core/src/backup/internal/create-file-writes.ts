import type { TextFile } from '@chris.araneo/file-system';
import { map } from 'lodash-es';
import type { Observable } from 'rxjs';

export const createFileWrites = (files: TextFile[]): Observable<void>[] =>
  map(files, (file) => file.writeToFile());
