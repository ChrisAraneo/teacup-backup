import { FileSystem } from './file-system.class';

export class FileFinder {
  static async findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    ignoreErrors: boolean = true,
    fileSystem: FileSystem = new FileSystem(),
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fileSystem
        .findFile(pattern, root, (result) => {
          resolve(result);
        })
        .error((error) => {
          if (!ignoreErrors) {
            reject(error);
          } else {
            resolve([]);
          }
        });
    });
  }

  static async findFiles(
    pattern: string | RegExp,
    roots: string[] = ['C:\\'],
    ignoreErrors: boolean = true,
  ): Promise<string[]> {
    const result: string[] = [];

    const promises = roots.map((root: string) => {
      return this.findFile(pattern, root, ignoreErrors);
    });

    (await Promise.all(promises)).map((items: string[]) => result.push(...items));

    return result;
  }
}
