import { formatIntervalUnits } from './format-interval-units';

describe('formatIntervalUnits', () => {
  it('should list every unit above zero when it gets the units', () => {
    const text = formatIntervalUnits({
      hours: 1,
      minutes: 1,
      seconds: 40,
      milliseconds: 0,
    });

    expect(text).toBe('1 hour 1 minute 40 s');
  });

  it('should give an empty text when every unit is zero', () => {
    const text = formatIntervalUnits({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    expect(text).toBe('');
  });

  it('should use plural units when the units are above one', () => {
    const text = formatIntervalUnits({
      hours: 0,
      minutes: 6,
      seconds: 1,
      milliseconds: 333,
    });

    expect(text).toBe('6 minutes 1 s 333 ms');
  });
});
