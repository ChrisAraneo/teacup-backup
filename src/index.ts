import Path from "path";
import { CurrentDirectoryProvider } from "./current-directory-provider";
import { MiniBackup } from "./mini-backup";
import { Config } from "./models/config.type";
import fs from "fs";

class App {
  static async main(): Promise<void> {
    this.ignoreWarnings();

    const miniBackup = new MiniBackup();

    miniBackup.promptUserSecretKey();

    const config: Config = (await miniBackup.readConfigFile()) as Config;
    const backupDirectory = Path.normalize(
      `${CurrentDirectoryProvider.getCurrentDirectory()}/${
        config.backupDirectory
      }`
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    config.files.forEach(async (file) => {
      const foundFiles = await miniBackup.findFiles(
        file.filename,
        config.roots
      );
      const filesInBase64 = await miniBackup.readFilesToBase64(foundFiles);
      const encrypted = await miniBackup.encryptBase64Files(filesInBase64);
      const writtenFiles = await miniBackup.writeEncryptedFiles(
        encrypted,
        backupDirectory
      );

      console.log(
        "Backup: ",
        writtenFiles.map((file) => file.getPath())
      );
    });
  }

  private static ignoreWarnings(): void {
    console.warn = () => {};
  }

  private static createDirectoryIfDoesntExist(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  }
}

App.main();
