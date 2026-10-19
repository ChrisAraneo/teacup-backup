import { formatFtpErrorText } from './format-ftp-error-text';

describe('formatFtpErrorText', () => {
  it('should list every own field as JSON when it gets an error record', () => {
    const text = formatFtpErrorText({
      message: 'refused',
      code: 'ECONNREFUSED',
    });

    expect(text).toBe('{"message":"refused","code":"ECONNREFUSED"}');
  });

  it('should include the stack and the message when it gets an error', () => {
    const text = formatFtpErrorText(new Error('refused'));

    expect(text).toContain('"stack":"Error: refused');
    expect(text).toContain('"message":"refused"');
  });

  it('should undo only the first doubled backslash when the JSON holds backslashes', () => {
    const text = formatFtpErrorText({ path: 'C:\\dir\\file', code: 'X' });

    expect(text).toBe('{"path":"C:\\dir\\\\file","code":"X"}');
  });
});
