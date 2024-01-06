import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import Path from 'path';
import { Observable, catchError, map } from 'rxjs';
import { Config, FtpConfig } from '../../models/config.type';
import { JsonFile } from '../../models/json-file.class';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { JsonFileReader } from '../file-reader/json-file-reader.class';
import { FileSystem } from '../file-system/file-system.class';
import { CONFIG_READING_ERROR_MESSAGE, INVALID_CONFIG_ERROR_MESSAGE } from './config-loader.consts';

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
      catchError(() => {
        throw Error(CONFIG_READING_ERROR_MESSAGE);
      }),
      map((result: unknown) => {
        const content: unknown = (result as JsonFile)?.getContent();

        if (this.isConfig(content)) {
          return content;
        } else {
          throw Error(INVALID_CONFIG_ERROR_MESSAGE);
        }
      }),
    );
  }

  private isConfig(object: unknown): object is Config {
    if (!object) {
      return false;
    }

    const validRoots = this.isStringArray((<Config>object).roots);
    const validFiles = this.isFilesArray((<Config>object).files);
    const validMode = (<Config>object).mode === 'backup' || (<Config>object).mode === 'restore';
    const validBackupDirectory = isString((<Config>object).backupDirectory);
    const validInterval = isNumber((<Config>object).interval);
    const validLogLevel = isString((<Config>object)['log-level']);
    const validFtp = this.isFtpConfig((<Config>object).ftp);

    return (
      validRoots &&
      validFiles &&
      validMode &&
      validBackupDirectory &&
      validInterval &&
      validLogLevel &&
      validFtp
    );
  }

  private isStringArray(object: unknown): object is string[] {
    return isArray(object) && object.every((item) => isString(item));
  }

  private isFilesArray(object: unknown): object is { filename: string }[] {
    return (
      isArray(object) && object.every((item) => isObject(item) && isString((item as any)?.filename))
    );
  }

  private isFtpConfig(object: unknown): object is FtpConfig {
    return (
      object === undefined ||
      (isBoolean((<FtpConfig>object).enabled) &&
        isString((<FtpConfig>object).host) &&
        isString((<FtpConfig>object).user) &&
        isString((<FtpConfig>object).password) &&
        isString((<FtpConfig>object).directory))
    );
  }
}
