import { MiniBackup } from "./mini-backup";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();

    const roots = ["D:\\", "E:\\"];
    const files = await miniBackup.findFiles("spiders-password-db.kdbx", roots);
    const base64s = await miniBackup.readFilesToBase64(files);
    const encrypted = await miniBackup.encryptTexts(base64s, 'super secret key');

    console.log("Results!", encrypted);
  }
}

App.main();
