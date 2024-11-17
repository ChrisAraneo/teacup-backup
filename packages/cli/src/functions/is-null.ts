import lodash from 'lodash';

export function isNull(x: unknown): x is null {
  return lodash.isNull(x);
}
