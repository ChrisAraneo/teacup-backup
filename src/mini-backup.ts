import CryptoAES from "crypto-js/aes";
import fileBase64 from "file-base64";
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

  async encryptTexts(texts: string[], secretKey: string): Promise<string[]> {
    return Promise.all(
      texts.map((text: string) => this.encryptText(text, secretKey))
    );
  }

  private async encryptText(text: string, secretKey: string): Promise<string> {
    return CryptoAES.encrypt(text, secretKey).toString();
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
