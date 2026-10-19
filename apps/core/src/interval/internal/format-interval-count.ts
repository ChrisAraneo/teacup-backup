import { match } from 'ts-pattern';

const SINGLE_COUNT = 1;

export const formatIntervalCount = (
  count: number,
  singularUnit: string,
  pluralUnit: string,
): string =>
  match(count)
    .with(SINGLE_COUNT, () => `${count} ${singularUnit}`)
    .when(
      (value) => value > 0,
      () => `${count} ${pluralUnit}`,
    )
    .otherwise(() => '');
