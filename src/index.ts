import { MiniBackup } from "./mini-backup";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();

    const roots = ["C:\\Users\\chris\\Documents\\"];
    const files = await miniBackup.findFiles("pliczek.txt", roots);
    const filesInBase64 = await miniBackup.readFilesToBase64(files);
    const encrypted = await miniBackup.encryptBase64Files(
      filesInBase64,
      "super secret key"
    );
    const writtenFiles = await miniBackup.writeEncryptedFiles(encrypted);

    console.log("Results!", writtenFiles);
  }
}

App.main();
