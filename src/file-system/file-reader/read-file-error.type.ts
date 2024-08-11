import { ReadFileResultStatus } from './read-file-result-status.enum';

export type ReadFileError = {
  status: ReadFileResultStatus.Error;
  message: string;
};
