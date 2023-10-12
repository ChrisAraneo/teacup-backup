import fs from "fs";
import Path from "path";
import { CurrentDirectoryProvider } from "./current-directory-provider";
import { FileProcessor } from "./file-processor";
import { MiniBackup } from "./mini-backup";
import { Config } from "./models/config.type";

class App {
  private static miniBackup = new MiniBackup();

  static async main(): Promise<void> {
    console.log("Mini Backup v. 0.1.0");

    this.ignoreWarnings();

    this.miniBackup.promptUserSecretKey();

    const config = (await this.miniBackup.readConfigFile()) as Config;

    if (config.mode === "backup") {
      this.runBackupFlow(config);
    } else if (config.mode === "restore") {
      this.runRestoreFlow(config);
    } else {
      throw Error("Invalid mode");
    }
  }

  private static async runBackupFlow(config: Config) {
    const backupDirectory = Path.normalize(
      `${CurrentDirectoryProvider.getCurrentDirectory()}/${
        config.backupDirectory
      }`
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    config.files.forEach(async (file) => {
      const foundFiles = await this.miniBackup.findFiles(
        file.filename,
        config.roots
      );
      const filesInBase64 = await this.miniBackup.readFilesToBase64(foundFiles);
      const encrypted = await this.miniBackup.encryptBase64Files(filesInBase64);
      const writtenEncryptedFiles = await this.miniBackup.writeEncryptedFiles(
        encrypted,
        backupDirectory
      );

      console.log(
        "Backup: ",
        writtenEncryptedFiles.map((file) => file.getPath())
      );
    });
  }

  private static async runRestoreFlow(config: Config) {
    const backupDirectory = Path.normalize(
      `${CurrentDirectoryProvider.getCurrentDirectory()}/${
        config.backupDirectory
      }`
    );

    this.createDirectoryIfDoesntExist(backupDirectory);

    const encryptedFiles: string[] = (
      await FileProcessor.listContentsOfDirectory(backupDirectory)
    ).filter((file) => file.lastIndexOf(".mbe") >= 0);
    const decrypted = await this.miniBackup.readEncryptedFiles(encryptedFiles);
    const writtenRestoredFiles = await this.miniBackup.writeRestoredFiles(
      decrypted
    );

    console.log("Restored: ", writtenRestoredFiles);
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
