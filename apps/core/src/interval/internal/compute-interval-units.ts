import { floor } from 'lodash-es';
import type { IntervalUnits } from './types/interval-units';

const MILLISECONDS_PER_SECOND = 1000;

const MILLISECONDS_PER_MINUTE = 1000 * 60;

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

const SECONDS_PER_MINUTE = 60;

const MINUTES_PER_HOUR = 60;

export const computeIntervalUnits = ({
  intervalInMs,
}: {
  intervalInMs: number;
}): IntervalUnits => ({
  hours: floor(intervalInMs / MILLISECONDS_PER_HOUR),
  minutes: floor((intervalInMs / MILLISECONDS_PER_MINUTE) % MINUTES_PER_HOUR),
  seconds: floor((intervalInMs / MILLISECONDS_PER_SECOND) % SECONDS_PER_MINUTE),
  milliseconds: intervalInMs % MILLISECONDS_PER_SECOND,
});
