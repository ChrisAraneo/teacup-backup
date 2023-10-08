import Path from "path";
import Process from "process";
import { MiniBackup } from "./mini-backup";
import { Config } from "./models/config.type";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();
  
    miniBackup.promptUserSecretKey();

    const config: Config = (await miniBackup.readConfigFile()) as Config;
    const backupDirectory = Path.normalize(
      `${this.getCurrentDirectory()}/${config.backupDirectory}`
    );

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

  private static getCurrentDirectory(): string {
    return Process.cwd();
  }
}

App.main();
