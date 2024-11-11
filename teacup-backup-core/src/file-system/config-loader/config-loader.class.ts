import { includes, isArray, isBoolean, isNumber, isString } from 'lodash';
import Path from 'path';
import { map, Observable } from 'rxjs';

import { Config, FtpConfig } from '../../models/config.type';
import { JsonFile } from '../../models/json-file.class';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { JsonFileReader } from '../file-reader/json-file-reader.class';
import { FileSystem } from '../file-system/file-system.class';
import {
  CONFIG_READING_ERROR_MESSAGE,
  INVALID_CONFIG_ERROR_MESSAGE,
} from './config-loader.consts';

export class ConfigLoader {
  private jsonFileReader: JsonFileReader;

  constructor(
    protected currentDirectory: CurrentDirectory,
    protected fileSystem: FileSystem,
  ) {
    this.jsonFileReader = new JsonFileReader(fileSystem);
  }

  readConfigFile(): Observable<Config> {
    const currentDirectory = this.currentDirectory.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);

    return this.jsonFileReader.readFile(path).pipe(
      map((result: unknown) => {
        if (result instanceof JsonFile) {
          const content: unknown = (result as JsonFile).getContent();

          if (this.isConfig(content)) {
            return content;
          } else {
            throw Error(INVALID_CONFIG_ERROR_MESSAGE);
          }
        } else {
          throw Error(CONFIG_READING_ERROR_MESSAGE);
        }
      }),
    );
  }

  private isConfig(object: unknown): object is Config {
    const validRoots = this.isStringArray((object as Config).roots);
    const validFiles = this.isStringArray((object as Config).files);
    const validMode = includes(['backup', 'restore'], (object as Config).mode);
    const validBackupDirectory = isString((object as Config).backupDirectory);
    const validInterval = isNumber((object as Config).interval);
    const validLogLevel = isString((object as Config)['log-level']);
    const validFtp = this.isFtpConfig((object as Config).ftp);

    // Stryker disable all : don't mutate all the operators, too many combinations to check
    return (
      validRoots &&
      validFiles &&
      validMode &&
      validBackupDirectory &&
      validInterval &&
      validLogLevel &&
      validFtp
    );
    // Stryker restore all
  }

  private isStringArray(object: unknown): object is string[] {
    return isArray(object) && object.every((item) => isString(item));
  }

  private isFtpConfig(object: unknown): object is FtpConfig {
    return (
      object === undefined ||
      (isBoolean((object as FtpConfig).enabled) &&
        isString((object as FtpConfig).host) &&
        isString((object as FtpConfig).user) &&
        isString((object as FtpConfig).password) &&
        isString((object as FtpConfig).directory))
    );
  }
}
