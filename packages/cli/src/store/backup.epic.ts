import { Logger } from '@chris.araneo/logger';
import { TeacupBackup } from '@teacup-backup/core';
import { filter, from, map, mergeMap, take } from 'rxjs';

import { addBackupTask, createBackup } from './backup.slice.js';
import { AppEpic } from './store.js';

const instance = new TeacupBackup(new Logger());

export const backupEpic: AppEpic = (action, state) =>
  action.pipe(
    filter(createBackup.match),
    mergeMap(() =>
      state.pipe(
        take(1),
        filter((state) => !state.backup.running),
        mergeMap((state) => {
          return from(instance.runBackupFlow(state.config)).pipe(
            map((task) => {
              return addBackupTask(task);
            }),
          );
        }),
      ),
    ),
  );
