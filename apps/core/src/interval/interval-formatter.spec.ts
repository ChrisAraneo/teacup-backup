import { IntervalFormatter } from './interval-formatter';

describe('IntervalFormatter', () => {
  it('should give milliseconds when the interval is below one second', () => {
    const intervalFormatter = new IntervalFormatter();

    const texts = [
      intervalFormatter.format(0),
      intervalFormatter.format(111),
      intervalFormatter.format(500),
      intervalFormatter.format(999),
    ];

    expect(texts).toEqual(['', '111 ms', '500 ms', '999 ms']);
  });

  it('should give seconds when the interval is below one minute', () => {
    const intervalFormatter = new IntervalFormatter();

    const texts = [
      intervalFormatter.format(1000),
      intervalFormatter.format(2000),
      intervalFormatter.format(3456),
      intervalFormatter.format(10121),
    ];

    expect(texts).toEqual(['1 s', '2 s', '3 s 456 ms', '10 s 121 ms']);
  });

  it('should give minutes when the interval is below one hour', () => {
    const intervalFormatter = new IntervalFormatter();

    const texts = [
      intervalFormatter.format(60000),
      intervalFormatter.format(360000),
      intervalFormatter.format(360511),
      intervalFormatter.format(361333),
    ];

    expect(texts).toEqual([
      '1 minute',
      '6 minutes',
      '6 minutes 511 ms',
      '6 minutes 1 s 333 ms',
    ]);
  });

  it('should give hours when the interval is one hour or more', () => {
    const intervalFormatter = new IntervalFormatter();

    const texts = [
      intervalFormatter.format(3600000),
      intervalFormatter.format(3700000),
      intervalFormatter.format(3600000 * 3),
      intervalFormatter.format(3600000 * 24),
    ];

    expect(texts).toEqual([
      '1 hour',
      '1 hour 1 minute 40 s',
      '3 hours',
      '24 hours',
    ]);
  });
});
