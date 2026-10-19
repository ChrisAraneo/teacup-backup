import type { UnknownTaskError } from './types/unknown-task-error';

export const createUnknownTaskError = (error: unknown): UnknownTaskError => ({
  task: 'UNKNOWN',
  message: error?.toString() || '',
  status: 'error',
});
