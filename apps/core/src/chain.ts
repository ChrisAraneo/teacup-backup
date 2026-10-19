import * as lodashModule from 'lodash-es';

const lodash = (lodashModule as unknown as { default: typeof lodashModule })
  .default;

export const { chain } = lodash;
