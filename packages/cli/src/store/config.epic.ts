import { JsonFile } from '@chris.araneo/file-system';
import { Config } from '@teacup-backup/core';
import { delay, filter, first, map, mergeMap } from 'rxjs';

import { instance } from '../instance.js';
import { loadConfig, readConfig } from './config.slice.js';
import { AppEpic } from './store.js';

export const configEpic: AppEpic = (action, state) =>
  action.pipe(
    filter(readConfig.match),
    mergeMap(() =>
      state.pipe(
        filter((state) => !state.config.loaded),
        first(),
        mergeMap(() =>
          instance
            .writeDefaultConfigWhenDoesntExist()
            .pipe(delay(500), first()),
        ),
        mergeMap(() =>
          instance.readConfig().pipe(
            map((result) => {
              if (result instanceof JsonFile) {
                return loadConfig(result.getContent() as Config);
              } else {
                throw Error(result.message);
              }
            }),
          ),
        ),
      ),
    ),
  );
