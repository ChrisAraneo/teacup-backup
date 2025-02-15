import { filter, from, map, mergeMap, take } from 'rxjs';

import { instance } from '../instance.js';
import { addBackupTask, createBackup } from './backup.slice.js';
import { AppEpic } from './store.js';

export const backupEpic: AppEpic = (action, state) =>
  action.pipe(
    filter(createBackup.match),
    mergeMap(() =>
      state.pipe(
        take(1),
        filter((state) => !state.backup.running),
        mergeMap((state) => {
          return from(instance.runBackupFlow(state.config.data)).pipe(
            map((task) => {
              return addBackupTask(task);
            }),
          );
        }),
      ),
    ),
  );
