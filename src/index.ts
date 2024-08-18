import { firstValueFrom, Observable } from 'rxjs';

import { ConfigLoader } from './file-system/config-loader/config-loader.class';
import { CurrentDirectory } from './file-system/current-directory/current-directory.class';
import { FileSystem } from './file-system/file-system/file-system.class';
import { Config } from './models/config.type';
import { TeacupBackup } from './teacup-backup';
import { IntervalFormatter } from './utils/interval-formatter.class';
import { Logger } from './utils/logger.class';

// Stryker disable all

class App {
  private static logger: Logger;
  private static teacupBackup: TeacupBackup;
  private static configLoader: ConfigLoader = new ConfigLoader(
    new CurrentDirectory(),
    new FileSystem(),
  );
  private static intervalFormatter: IntervalFormatter = new IntervalFormatter();

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

    this.printTitleAndAscii('0.5.1');

    this.teacupBackup.promptUserSecretKey();

    const intervalInSeconds = +config.interval;

    if (config.mode === 'backup') {
      if (intervalInSeconds > 0) {
        this.logger.info(
          `Application will check specified files and perform backups on them every ${App.intervalFormatter.format(
            intervalInSeconds * 1000,
          )}`,
        );

        setInterval(() => {
          this.teacupBackup.runBackupFlow(config);
        }, intervalInSeconds * 1000);
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

  private static printTitleAndAscii(version: string): void {
    this.logger.info(`Teacup Backup - version ${version}

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⡇⣴⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⡟⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⠿⠋⢀⣼⣿⣿⡷⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⠀⠀⢀⣴⣿⣿⣿⡿⠀⢹⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⡟⠀⣰⣿⣿⣿⡿⠋⠀⣠⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⡟⠀⢰⣿⣿⣿⠋⠀⢠⣾⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣇⠀⠸⣿⣿⡇⠀⠀⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⡆⠀⠹⣿⣿⠀⠀⠻⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣬⣭⣷⣶⣶⣾⣿⣶⣶⣶⣮⣭⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣶⣿⠿⠛⠛⠉⠉⢀⣀⣀⣀⣀⣀⣀⣀⣀⠀⢀⣀⡈⠉⠉⠛⠻⢿⣷⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣴⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣤⣤⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⣿⡿⠃⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠀⠀⣾⡿⠘⣻⣿⡿⠿⣿⣿⣿⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣇⠀⣀⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠇⣴⣿⠏⠀⠀⣸⣿⣸⡟⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡟⣸⣿⠁⠀⣠⣾⣿⣿⣿⠃⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣠⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣱⣿⣿⣶⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀
⠀⠀⣠⣴⣾⠿⠟⠋⢩⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⡿⠿⠋⠙⢻⣿⣷⣤⡀⠀⠀⠀
⢠⣾⡿⠋⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣯⣿⣿⠁⠀⠀⠀⠀⠀⠉⠉⠻⣿⣆⠀⠀
⣼⣿⣦⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠠⠶⢰⣿⣿⣷⡄
⠸⣿⣾⡇⠀⠀⠀⠀⠀⠉⠛⠻⢿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⣾⠿⠛⢿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⡿⣿⡇
⠀⠘⠻⣿⣶⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠃⠀⣤⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣾⣿⣿⣼⣿⠃
⠀⠀⠀⠈⠙⠻⣿⣿⣶⣦⣤⣤⣤⣄⣀⣀⡀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣶⣿⢿⣿⣽⣶⡿⠟⠁⠀
⠀⠀⠀⠀⠀⠀⠈⠙⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣤⣤⣤⣼⣿⣿⣿⣶⣿⣿⣿⣟⣻⣭⣵⣾⡿⠿⠛⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠛⠻⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠛⠛⠛⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
`);
  }
}

App.main();
