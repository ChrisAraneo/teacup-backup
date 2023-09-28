import find from "find";

export class MiniBackup {
  async findFiles(
    pattern: string | RegExp,
    roots: string[] = ["C:\\"]
  ): Promise<string[]> {
    const result: string[] = [];

    const promises = roots.map((root: string) => {
      return this.findFile(pattern, root);
    });

    (await Promise.all(promises)).map((items: string[]) =>
      result.push(...items)
    );

    return result;
  }

  private async findFile(
    pattern: string | RegExp,
    root: string = "C:\\"
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      find
        .file(pattern, root, (result) => {
          resolve(result);
        })
        .error((error) => {
          reject(error);
        });
    });
  }
}
