import { isString } from 'lodash-es';
import { match } from 'ts-pattern';
import type { Config } from '../../types/config';

export const serializeConfig = (config: Config | string): string =>
  match(config)
    .when(isString, (text) => text)
    .otherwise((value) => JSON.stringify(value));
