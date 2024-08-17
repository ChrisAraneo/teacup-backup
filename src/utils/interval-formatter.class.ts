export class IntervalFormatter {
  constructor() {}

  format(intervalInMs: number): string {
    const millis = intervalInMs % 1000;
    const secs = Math.floor((intervalInMs / 1000) % 60);
    const mins = Math.floor((intervalInMs / (1000 * 60)) % 60);
    const hours = Math.floor(intervalInMs / (1000 * 60 * 60));

    const result = [];

    if (hours > 0) {
      result.push(hours === 1 ? '1 hour' : hours + ' hours');
    }

    if (mins > 0) {
      result.push(mins === 1 ? '1 minute' : mins + ' minutes');
    }

    if (secs > 0) {
      result.push(secs + ' s');
    }

    if (millis > 0) {
      result.push(millis + ' ms');
    }

    return result.join(' ');
  }
}
