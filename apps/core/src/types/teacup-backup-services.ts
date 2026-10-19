import type {
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

export interface TeacupBackupServices {
  fileSystem: FileSystem;
  fileFinder: FileFinder;
  currentDirectory: CurrentDirectory;
  directoryCreator: DirectoryCreator;
  base64FileReader: Base64FileReader;
  base64FileWriter: Base64FileWriter;
  textFileWriter: TextFileWriter;
  jsonFileReader: JsonFileReader;
  logger: Logger;
}
