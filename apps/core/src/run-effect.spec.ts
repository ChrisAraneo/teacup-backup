import { runEffect } from './run-effect';

const RECORD = { name: 'alpha' };

describe('runEffect', () => {
  it('should give back the same value when it runs the effect', () => {
    const result = runEffect(RECORD, () => 'ignored');

    expect(result).toBe(RECORD);
  });

  it('should hand the value to the effect when it runs the effect', () => {
    const seen: unknown[] = [];

    runEffect(RECORD, (value) => seen.push(value));

    expect(seen).toEqual([RECORD]);
    expect(seen[0]).toBe(RECORD);
  });
});
