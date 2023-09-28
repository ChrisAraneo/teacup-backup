import find from "find";
import fileBase64 from "file-base64";

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

  async readFilesToBase64(files: string[]): Promise<string[]> {
    return Promise.all(
      files.map((file: string) => {
        return new Promise((resolve, reject) => {
          fileBase64.encode(file, (error, result: string) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      })
    ) as Promise<string[]>;
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
