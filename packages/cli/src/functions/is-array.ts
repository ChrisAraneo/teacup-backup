import lodash from 'lodash';

export function isArray<T>(x: unknown): x is T[] {
  return lodash.isArray<T>(x);
}
