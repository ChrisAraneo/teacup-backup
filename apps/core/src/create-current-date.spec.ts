import { createCurrentDate } from './create-current-date';

describe('createCurrentDate', () => {
  it('should give the present moment when it is called', () => {
    const before = new Date();

    const date = createCurrentDate();

    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should give a new date when it is called twice', () => {
    const dates = [createCurrentDate(), createCurrentDate()];

    expect(dates[0]).not.toBe(dates[1]);
  });
});
