import { createUnknownTaskError } from './create-unknown-task-error';

describe('createUnknownTaskError', () => {
  it('should describe the error as an unknown task when it gets an error', () => {
    const taskError = createUnknownTaskError(new Error('broken'));

    expect(taskError).toEqual({
      task: 'UNKNOWN',
      message: 'Error: broken',
      status: 'error',
    });
  });

  it('should give an empty message when the error is missing or empty', () => {
    const messages = [
      createUnknownTaskError(null).message,
      createUnknownTaskError(undefined).message,
      createUnknownTaskError('').message,
    ];

    expect(messages).toEqual(['', '', '']);
  });
});
