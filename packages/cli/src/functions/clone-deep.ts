import lodash from 'lodash';

export function cloneDeep<T>(x: T): T {
  return lodash.cloneDeep<T>(x);
}
