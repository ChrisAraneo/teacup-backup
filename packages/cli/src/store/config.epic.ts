import { JsonFile } from '@chris.araneo/file-system';
import { Config } from '@teacup-backup/core';
import { combineEpics } from 'redux-observable';
import { debounceTime, delay, filter, first, map, mergeMap } from 'rxjs';

import { instance } from '../instance.js';
import {
  loadConfig,
  noop,
  readConfig as readConfigAction,
} from './config.slice.js';
import { setPage } from './page.slice.js';
import { AppEpic } from './store.js';

const readConfigEpic: AppEpic = (action, state) =>
  action.pipe(
    filter(readConfigAction.match),
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

const writeConfigEpic: AppEpic = (action, state) =>
  action.pipe(
    filter(setPage.match),
    mergeMap(() =>
      state.pipe(
        filter((state) => !!state.config.loaded),
        debounceTime(500),
        first(),
        mergeMap((state) =>
          instance.writeConfig(state.config.data).pipe(map(() => noop())),
        ),
      ),
    ),
  );

export const configEpic = combineEpics(readConfigEpic, writeConfigEpic);
