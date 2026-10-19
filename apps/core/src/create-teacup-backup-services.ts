import {
  Base64FileReader,
  Base64FileWriter,
  CurrentDirectory,
  DirectoryCreator,
  FileFinder,
  FileSystem,
  JsonFileReader,
  TextFileWriter,
} from '@chris.araneo/file-system';
import type { Logger } from '@chris.araneo/logger';
import { chain } from './chain';
import type { TeacupBackupServices } from './types/teacup-backup-services';

export const createTeacupBackupServices = (
  logger: Logger,
): TeacupBackupServices =>
  chain(new FileSystem())
    .thru(
      (fileSystem): TeacupBackupServices => ({
        fileSystem,
        fileFinder: new FileFinder(fileSystem, logger),
        currentDirectory: new CurrentDirectory(),
        directoryCreator: new DirectoryCreator(fileSystem, logger),
        base64FileReader: new Base64FileReader(fileSystem),
        base64FileWriter: new Base64FileWriter(fileSystem),
        textFileWriter: new TextFileWriter(fileSystem),
        jsonFileReader: new JsonFileReader(fileSystem),
        logger,
      }),
    )
    .value();
