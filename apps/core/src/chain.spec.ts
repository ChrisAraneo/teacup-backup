import { size } from 'lodash-es';

import { chain } from './chain';

describe('chain', () => {
  it('should run the steps in order when it gets a number', () => {
    const result = chain(2)
      .thru((value) => value + 1)
      .thru((value) => value * 10)
      .value();

    expect(result).toBe(30);
  });

  it('should keep the wrapper steps when it gets a list', () => {
    const result = chain(['alpha', 'beta', 'gamma'])
      .thru((items) => size(items))
      .value();

    expect(result).toBe(3);
  });
});
