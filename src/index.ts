import { firstValueFrom } from 'rxjs';
import { MiniBackup } from './mini-backup';
import { Config } from './models/config.type';
import { Logger } from './utils/logger.class';

class App {
  private static logger = new Logger();
  private static miniBackup = new MiniBackup();

  static async main(): Promise<void> {
    this.logger.info('Mini Backup - version 0.3.0');

    this.miniBackup.promptUserSecretKey();

    const config = (await firstValueFrom(this.miniBackup.readConfigFile())) as Config;
    const interval = +config.interval;

    if (config.mode === 'backup') {
      if (interval > 0) {
        this.logger.info(
          `The application will check files and perform backups on the specified files every ${interval} seconds.`,
        );

        setInterval(() => {
          this.miniBackup.runBackupFlow(config);
        }, interval * 1000);
      }

      this.miniBackup.runBackupFlow(config);
    } else if (config.mode === 'restore') {
      this.miniBackup.runRestoreFlow(config);
    } else {
      throw Error('Invalid mode');
    }
  }
}

App.main();
