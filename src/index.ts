import { MiniBackup } from "./mini-backup";
import { Config } from "./models/config.type";

const Path = require("path");

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();
  
    miniBackup.promptUserSecretKey();

    const config: Config = (await miniBackup.readConfigFile()) as Config;
    const backupDirectory = Path.normalize(`${__dirname}/${config.backupDirectory}`);

    config.files.forEach(async (file) => {
      const foundFiles = await miniBackup.findFiles(
        file.filename,
        config.roots
      );
      const filesInBase64 = await miniBackup.readFilesToBase64(foundFiles);
      const encrypted = await miniBackup.encryptBase64Files(filesInBase64);
      const writtenFiles = await miniBackup.writeEncryptedFiles(encrypted, backupDirectory);

      console.log(
        "Backup: ",
        writtenFiles.map((file) => file.getPath())
      );
    });
  }
}

App.main();
