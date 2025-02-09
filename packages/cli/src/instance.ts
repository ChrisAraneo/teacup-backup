import { Logger } from '@chris.araneo/logger';
import { TeacupBackup } from '@teacup-backup/core';

export const instance = new TeacupBackup(new Logger());
