export interface FindFileResult {
  success: boolean;
  pattern: string;
  root: string;
  result: string[];
  message: Error | string | null;
}
