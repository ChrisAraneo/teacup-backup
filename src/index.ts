import { MiniBackup } from "./mini-backup";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();

    const roots = ["C:\\Users\\chris\\Documents\\"];
    const filename = "beztytulu.png";
    const key = "super secret key";
    const files = await miniBackup.findFiles(filename, roots);
    const filesInBase64 = await miniBackup.readFilesToBase64(files);
    const encrypted = await miniBackup.encryptBase64Files(filesInBase64, key);
    const writtenFiles = await miniBackup.writeEncryptedFiles(encrypted);

    setTimeout(async () => {
      const readFiles = await miniBackup.readEncryptedFiles(writtenFiles, key);
      const results = await miniBackup.writeRestoredFiles(readFiles);

      console.log("Results!", results);
    }, 2500);
  }
}

App.main();
