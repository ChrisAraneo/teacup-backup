import { replace, split } from 'lodash-es';

export const toFilenameDate = (date: Date): string =>
  replace(replace(split(date.toISOString(), 'T')[0], '-', ''), '-', '');
