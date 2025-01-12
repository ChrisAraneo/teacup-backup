import { TaskId } from './task-id.enum';
import { TaskStatus } from './task-status.enum';

export interface Task {
  id: TaskId;
  status: TaskStatus;
  message: string;
}
