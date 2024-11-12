import { ReadFileResultStatus } from './read-file-result-status.enum';

export interface ReadFileError {
  status: ReadFileResultStatus.Error;
  message: string;
}
