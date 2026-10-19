import { formatInterval } from './interval-formatter';

describe('formatInterval', () => {
  it('should give milliseconds when the interval is below one second', () => {
    const texts = [
      formatInterval(0),
      formatInterval(111),
      formatInterval(500),
      formatInterval(999),
    ];

    expect(texts).toEqual(['', '111 ms', '500 ms', '999 ms']);
  });

  it('should give seconds when the interval is below one minute', () => {
    const texts = [
      formatInterval(1000),
      formatInterval(2000),
      formatInterval(3456),
      formatInterval(10121),
    ];

    expect(texts).toEqual(['1 s', '2 s', '3 s 456 ms', '10 s 121 ms']);
  });

  it('should give minutes when the interval is below one hour', () => {
    const texts = [
      formatInterval(60000),
      formatInterval(360000),
      formatInterval(360511),
      formatInterval(361333),
    ];

    expect(texts).toEqual([
      '1 minute',
      '6 minutes',
      '6 minutes 511 ms',
      '6 minutes 1 s 333 ms',
    ]);
  });

  it('should give hours when the interval is one hour or more', () => {
    const texts = [
      formatInterval(3600000),
      formatInterval(3700000),
      formatInterval(3600000 * 3),
      formatInterval(3600000 * 24),
    ];

    expect(texts).toEqual([
      '1 hour',
      '1 hour 1 minute 40 s',
      '3 hours',
      '24 hours',
    ]);
  });
});
