import { IntervalFormatter } from './interval-formatter.class';

describe('IntervalFormatter', () => {
  let intervalFormatter: IntervalFormatter;

  beforeEach(() => {
    intervalFormatter = new IntervalFormatter();
  });

  describe('#format', () => {
    it('should correctly format intervals below one second', () => {
      expect(intervalFormatter.format(0)).toBe('');
      expect(intervalFormatter.format(111)).toBe('111 ms');
      expect(intervalFormatter.format(500)).toBe('500 ms');
      expect(intervalFormatter.format(999)).toBe('999 ms');
    });

    it('should correctly format intervals below one minute', () => {
      expect(intervalFormatter.format(1000)).toBe('1 s');
      expect(intervalFormatter.format(2000)).toBe('2 s');
      expect(intervalFormatter.format(3456)).toBe('3 s 456 ms');
      expect(intervalFormatter.format(10121)).toBe('10 s 121 ms');
    });

    it('should correctly format intervals below one hour', () => {
      expect(intervalFormatter.format(60000)).toBe('1 minute');
      expect(intervalFormatter.format(360000)).toBe('6 minutes');
      expect(intervalFormatter.format(360511)).toBe('6 minutes 511 ms');
      expect(intervalFormatter.format(361333)).toBe('6 minutes 1 s 333 ms');
    });

    it('should correctly format intervals larger than or equal one hour', () => {
      expect(intervalFormatter.format(3600000)).toBe('1 hour');
      expect(intervalFormatter.format(3700000)).toBe('1 hour 1 minute 40 s');
      expect(intervalFormatter.format(3600000 * 3)).toBe('3 hours');
      expect(intervalFormatter.format(3600000 * 24)).toBe('24 hours');
    });
  });
});
