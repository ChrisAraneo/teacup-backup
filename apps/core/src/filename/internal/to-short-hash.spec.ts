import { toShortHash } from './to-short-hash';

describe('toShortHash', () => {
  it('should keep the first five characters when it gets a full hash', () => {
    const text = toShortHash('896cf7fea226abfc34207218968d76a3');

    expect(text).toBe('896cf');
  });

  it('should keep the whole text when the hash is shorter than five characters', () => {
    const texts = [toShortHash('abc'), toShortHash('')];

    expect(texts).toEqual(['abc', '']);
  });
});
