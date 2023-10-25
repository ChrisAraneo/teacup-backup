import FS from 'fs';

export class DirectoryInfo {
  static async getContents(directory: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      FS.readdir(directory, (error: unknown, files: string[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }
}
