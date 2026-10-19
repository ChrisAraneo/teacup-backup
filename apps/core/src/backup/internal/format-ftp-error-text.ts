import { replace } from 'lodash-es';

export const formatFtpErrorText = (error: unknown): string =>
  replace(
    JSON.stringify(error, Object.getOwnPropertyNames(error)),
    '\\\\',
    '\\',
  );
