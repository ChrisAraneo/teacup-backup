import { Logger } from '../../utils/logger.class';
import { FileSystem } from '../file-system/file-system.class';
import { CREATE_DIRECTORY_ERROR_MESSAGE } from './directory-creator.consts';

export class DirectoryCreator {
  constructor(
    private fileSystem: FileSystem,
    private logger: Logger,
  ) {}

  async createIfDoesntExist(directory: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.fileSystem.existsSync(directory)) {
        this.logger.debug(`Creating directory: '${directory}'`);

        this.fileSystem.mkdirSync(
          directory,
          { recursive: true },
          (error: NodeJS.ErrnoException, path?: string) => {
            if (error || !path) {
              reject(CREATE_DIRECTORY_ERROR_MESSAGE);

              return;
            }

            this.logger.debug('Created directory');
            resolve();
          },
        );
      } else {
        this.logger.debug('Directory already exists');
        resolve();
      }
    });
  }
}
