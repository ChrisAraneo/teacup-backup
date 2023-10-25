import find from 'find';

export class FileFinder {
  static async findFile(
    pattern: string | RegExp,
    root: string = 'C:\\',
    ignoreErrors: boolean = true,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      find
        .file(pattern, root, (result) => {
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
