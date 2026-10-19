import { compact, join } from 'lodash-es';
import { formatIntervalCount } from './format-interval-count';
import type { IntervalUnits } from './types/interval-units';

export const formatIntervalUnits = ({
  hours,
  minutes,
  seconds,
  milliseconds,
}: IntervalUnits): string =>
  join(
    compact([
      formatIntervalCount(hours, 'hour', 'hours'),
      formatIntervalCount(minutes, 'minute', 'minutes'),
      formatIntervalCount(seconds, 's', 's'),
      formatIntervalCount(milliseconds, 'ms', 'ms'),
    ]),
    ' ',
  );
