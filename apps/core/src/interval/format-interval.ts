import { flow } from 'lodash-es';
import { computeIntervalUnits } from './internal/compute-interval-units';
import { formatIntervalUnits } from './internal/format-interval-units';

export const formatInterval = (intervalInMs: number): string =>
  flow(computeIntervalUnits, formatIntervalUnits)({ intervalInMs });
