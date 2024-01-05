import { FileSystem } from '../file-system/file-system.class';
import { Logger } from '../../utils/logger.class';

export class DirectoryCreator {
  constructor(
    private fileSystem: FileSystem,
    private logger: Logger,
  ) {}

  createIfDoesntExist(directory: string): void {
    if (!this.fileSystem.existsSync(directory)) {
      this.logger.debug(`Creating directory: '${directory}'`);

      this.fileSystem.mkdirSync(
        directory,
        { recursive: true },
        (error: NodeJS.ErrnoException, path?: string) => {
          if (error) {
            throw Error("Can't create directory");
          } else if (path) {
            this.logger.debug('Created directory');
          }
        },
      );
    }
  }
}
