import fs from "fs";
import Path from "path";
import { CurrentDirectoryProvider } from "./current-directory-provider";
import { FileProcessor } from "./file-processor";
import { MiniBackup } from "./mini-backup";
import { Config } from "./models/config.type";

class App {
  private static miniBackup = new MiniBackup();

  static async main(): Promise<void> {
    console.log("Mini Backup - version 0.2.0");

    this.ignoreWarnings();

    this.miniBackup.promptUserSecretKey();

    const config = (await this.miniBackup.readConfigFile()) as Config;
    const interval = +config.interval;

    if (config.mode === "backup") {
      if (interval > 0) {
        console.log(
          `The application will check files and perform backups on the specified files every ${interval} seconds.`
        );

        setInterval(() => {
          this.runBackupFlow(config);
        }, interval * 1000);
      }

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
      console.log("Searching file:", file.filename);

      const foundFiles = await this.miniBackup.findFiles(
        file.filename,
        config.roots
      );

      console.log("Found files:", foundFiles);

      const filesInBase64 = await this.miniBackup.readFilesToBase64(foundFiles);
      const encrypted = await this.miniBackup.encryptBase64Files(filesInBase64);
      const writtenEncryptedFiles = await this.miniBackup.writeEncryptedFiles(
        encrypted,
        backupDirectory
      );

      console.log(
        "Backup:",
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

    console.log("Decrypting files:", encryptedFiles);

    const decrypted = await this.miniBackup.readEncryptedFiles(encryptedFiles);
    const writtenRestoredFiles = await this.miniBackup.writeRestoredFiles(
      decrypted
    );

    console.log("Restored:", writtenRestoredFiles);
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
