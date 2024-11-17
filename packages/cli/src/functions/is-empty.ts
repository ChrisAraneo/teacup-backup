import lodash from 'lodash';

type NonEmptyArray<T> = [T, ...T[]];

export function isEmpty<T>(x: unknown): x is NonEmptyArray<T> {
  return lodash.isArray<T>(x) && x.length > 0;
}
