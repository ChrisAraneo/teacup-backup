import { computeIntervalUnits } from './compute-interval-units';

describe('computeIntervalUnits', () => {
  it('should split the interval into hours, minutes, seconds and milliseconds when it gets an interval', () => {
    const units = computeIntervalUnits({ intervalInMs: 3_723_004 });

    expect(units).toEqual({
      hours: 1,
      minutes: 2,
      seconds: 3,
      milliseconds: 4,
    });
  });

  it('should give zero units when the interval is zero', () => {
    const units = computeIntervalUnits({ intervalInMs: 0 });

    expect(units).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('should keep the hours above a day when the interval is longer than a day', () => {
    const units = computeIntervalUnits({ intervalInMs: 90_000_000 });

    expect(units).toEqual({
      hours: 25,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});
