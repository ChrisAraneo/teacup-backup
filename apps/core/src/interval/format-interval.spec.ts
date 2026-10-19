import { formatInterval } from './format-interval';

describe('formatInterval', () => {
  it('should give an empty text when the interval is zero', () => {
    const text = formatInterval(0);

    expect(text).toBe('');
  });

  it('should give milliseconds when the interval is below one second', () => {
    const text = formatInterval(111);

    expect(text).toBe('111 ms');
  });

  it('should give seconds and milliseconds when the interval is below one minute', () => {
    const text = formatInterval(3456);

    expect(text).toBe('3 s 456 ms');
  });

  it('should give every unit when the interval is above one hour', () => {
    const texts = [formatInterval(3_700_000), formatInterval(3_600_000 * 24)];

    expect(texts).toEqual(['1 hour 1 minute 40 s', '24 hours']);
  });
});
