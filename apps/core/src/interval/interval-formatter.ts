import { formatInterval } from './format-interval';

export class IntervalFormatter {
  format(intervalInMs: number): string {
    return formatInterval(intervalInMs);
  }
}
