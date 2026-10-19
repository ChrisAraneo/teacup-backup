import { toFilenameDate } from './to-filename-date';

describe('toFilenameDate', () => {
  it('should give the year, month and day without dashes when it gets a date', () => {
    const text = toFilenameDate(new Date('2024-03-15T12:00:00.000Z'));

    expect(text).toBe('20240315');
  });

  it('should use the UTC day when the local day differs', () => {
    const text = toFilenameDate(new Date('2024-03-15T23:30:00.000Z'));

    expect(text).toBe('20240315');
  });
});
