import { formatErrorText } from './format-error-text';

describe('formatErrorText', () => {
  it('should give the name and the message when it gets an error', () => {
    const text = formatErrorText(new Error('broken'));

    expect(text).toBe('Error: broken');
  });

  it('should give the text itself when it gets a text', () => {
    const text = formatErrorText("Can't create directory");

    expect(text).toBe("Can't create directory");
  });

  it('should give an empty text when it gets nothing', () => {
    const texts = [formatErrorText(null), formatErrorText(undefined)];

    expect(texts).toEqual(['', '']);
  });

  it('should give the digits when it gets a number', () => {
    const text = formatErrorText(0);

    expect(text).toBe('0');
  });
});
