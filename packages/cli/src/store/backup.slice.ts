import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskId, TaskStatus } from '@teacup-backup/core';

export const backupSlice = createSlice({
  name: 'backup',
  initialState: {
    running: false,
    tasks: [] as Task[],
  },
  reducers: {
    createBackup: (state) => {
      return state;
    },
    addBackupTask: (state, action: PayloadAction<Task>) => {
      const task = action.payload;

      if (task.id === TaskId.Start) {
        return { tasks: [task], running: true };
      }

      const running =
        action.payload.id !== TaskId.Finalize &&
        action.payload.status === TaskStatus.Success;
      const tasks = [...state.tasks, action.payload];

      return { tasks, running };
    },
  },
});

export const { createBackup, addBackupTask } = backupSlice.actions;

export default backupSlice.reducer;
