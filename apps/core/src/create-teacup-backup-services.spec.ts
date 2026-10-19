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
import { get, keys } from 'lodash-es';

import { createTeacupBackupServices } from './create-teacup-backup-services';

const LOGGER = { debug: () => 'ignored' } as unknown as Logger;

describe('createTeacupBackupServices', () => {
  it('should create every service when it gets a logger', () => {
    const services = createTeacupBackupServices(LOGGER);

    expect(keys(services)).toEqual([
      'fileSystem',
      'fileFinder',
      'currentDirectory',
      'directoryCreator',
      'base64FileReader',
      'base64FileWriter',
      'textFileWriter',
      'jsonFileReader',
      'logger',
    ]);
    expect(services.fileSystem).toBeInstanceOf(FileSystem);
    expect(services.fileFinder).toBeInstanceOf(FileFinder);
    expect(services.currentDirectory).toBeInstanceOf(CurrentDirectory);
    expect(services.directoryCreator).toBeInstanceOf(DirectoryCreator);
    expect(services.base64FileReader).toBeInstanceOf(Base64FileReader);
    expect(services.base64FileWriter).toBeInstanceOf(Base64FileWriter);
    expect(services.textFileWriter).toBeInstanceOf(TextFileWriter);
    expect(services.jsonFileReader).toBeInstanceOf(JsonFileReader);
    expect(services.logger).toBe(LOGGER);
  });

  it('should share one file system and the logger when it creates the services', () => {
    const services = createTeacupBackupServices(LOGGER);

    expect(get(services.fileFinder, 'fileSystem')).toBe(services.fileSystem);
    expect(get(services.fileFinder, 'logger')).toBe(LOGGER);
    expect(get(services.directoryCreator, 'fileSystem')).toBe(
      services.fileSystem,
    );
    expect(get(services.directoryCreator, 'logger')).toBe(LOGGER);
    expect(get(services.base64FileReader, 'fileSystem')).toBe(
      services.fileSystem,
    );
    expect(get(services.base64FileWriter, 'fileSystem')).toBe(
      services.fileSystem,
    );
    expect(get(services.textFileWriter, 'fileSystem')).toBe(
      services.fileSystem,
    );
    expect(get(services.jsonFileReader, 'fileSystem')).toBe(
      services.fileSystem,
    );
  });
});
