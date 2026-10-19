import type { TaskId } from './task-id';
import type { TaskStatus } from './task-status';

export interface Task {
  id: TaskId;
  status: TaskStatus;
  message: string;
  dependsOn?: TaskId;
}
