import { FileSystem } from './file-system/file-system.class';
import { MiniBackup } from './mini-backup';
import { Config } from './models/config.type';

class App {
  private static miniBackup = new MiniBackup();

  static async main(): Promise<void> {
    console.log('Mini Backup - version 0.2.0');

    this.ignoreWarnings();

    this.miniBackup.promptUserSecretKey();

    const config = (await this.miniBackup.readConfigFile()) as Config;
    const interval = +config.interval;

    if (config.mode === 'backup') {
      if (interval > 0) {
        console.log(
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

  private static ignoreWarnings(): void {
    console.warn = (): undefined => {};
  }
}

App.main();
