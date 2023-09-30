import { MiniBackup } from "./mini-backup";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();

    const roots = ["D:\\", "E:\\"];
    const files = await miniBackup.findFiles("spiders-password-db.kdbx", roots);
    const filesInBase64 = await miniBackup.readFilesToBase64(files);
    const encrypted = await miniBackup.encryptBase64Files(
      filesInBase64,
      "super secret key"
    );

    console.log("Results!", encrypted);
  }
}

App.main();
