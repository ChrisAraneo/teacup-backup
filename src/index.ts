import { Observable, firstValueFrom } from 'rxjs';
import { ConfigLoader } from './file-system/config-loader/config-loader.class';
import { CurrentDirectory } from './file-system/current-directory/current-directory.class';
import { FileSystem } from './file-system/file-system/file-system.class';
import { TeacupBackup } from './teacup-backup';
import { Config } from './models/config.type';
import { Logger } from './utils/logger.class';

// Stryker disable all

class App {
  private static logger: Logger;
  private static teacupBackup: TeacupBackup;
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
    App.teacupBackup = new TeacupBackup(App.logger);

    this.logger.info('Teacup Backup - version 0.4.1');

    this.teacupBackup.promptUserSecretKey();

    const interval = +config.interval;

    if (config.mode === 'backup') {
      if (interval > 0) {
        this.logger.info(
          `The application will check files and perform backups on the specified files every ${interval} seconds.`,
        );

        setInterval(() => {
          this.teacupBackup.runBackupFlow(config);
        }, interval * 1000);
      }

      this.teacupBackup.runBackupFlow(config);
    } else if (config.mode === 'restore') {
      this.teacupBackup.runRestoreFlow(config);
    } else {
      this.logger.error('Invalid mode');
    }
  }

  private static readConfigFile(): Observable<object> {
    return this.configLoader.readConfigFile();
  }
}

App.main();
