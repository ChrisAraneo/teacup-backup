import { formatIntervalCount } from './format-interval-count';

describe('formatIntervalCount', () => {
  it('should use the singular unit when the count is one', () => {
    const text = formatIntervalCount(1, 'hour', 'hours');

    expect(text).toBe('1 hour');
  });

  it('should use the plural unit when the count is above one', () => {
    const text = formatIntervalCount(3, 'hour', 'hours');

    expect(text).toBe('3 hours');
  });

  it('should keep the fraction when the count is a fraction', () => {
    const text = formatIntervalCount(1.5, 'ms', 'ms');

    expect(text).toBe('1.5 ms');
  });

  it('should give an empty text when the count is zero or below', () => {
    const texts = [
      formatIntervalCount(0, 'hour', 'hours'),
      formatIntervalCount(-2, 'hour', 'hours'),
    ];

    expect(texts).toEqual(['', '']);
  });
});
