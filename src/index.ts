import { Observable, firstValueFrom } from 'rxjs';
import { ConfigLoader } from './file-system/config-loader/config-loader.class';
import { CurrentDirectory } from './file-system/current-directory/current-directory.class';
import { FileSystem } from './file-system/file-system/file-system.class';
import { MiniBackup } from './mini-backup';
import { Config } from './models/config.type';
import { Logger } from './utils/logger.class';

class App {
  private static logger: Logger;
  private static miniBackup: MiniBackup;
  private static configLoader: ConfigLoader = new ConfigLoader(
    new CurrentDirectory(),
    new FileSystem(),
  );

  static async main(): Promise<void> {
    const config: Config | undefined = (await firstValueFrom(App.readConfigFile()).catch(
      (error) => {
        new Logger('error').error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      },
    )) as Config;

    if (!config) {
      return;
    }

    App.logger = new Logger(config['log-level']);
    App.miniBackup = new MiniBackup(App.logger);

    this.logger.info('Mini Backup - version 0.3.0');

    this.miniBackup.promptUserSecretKey();

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
      this.logger.error('Invalid mode');
    }
  }

  private static readConfigFile(): Observable<object> {
    return this.configLoader.readConfigFile();
  }
}

App.main();
