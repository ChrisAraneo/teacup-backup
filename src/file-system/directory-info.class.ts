import { FileSystem } from './file-system.class';

export class DirectoryInfo {
  static async getContents(
    directory: string,
    fileSystem: FileSystem = new FileSystem(),
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fileSystem.readdir(directory, (error: unknown, files: string[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }
}
