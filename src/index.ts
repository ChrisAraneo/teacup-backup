import { read } from "fs";
import { FileEncryptor } from "./file-encryptor";
import { MiniBackup } from "./mini-backup";
import { EncryptedFile } from "./models/encrypted-file.class";
import CryptoJS from "crypto-js";
import CryptoAES from "crypto-js/aes";

class App {
  static async main(): Promise<void> {
    const miniBackup = new MiniBackup();

    const roots = ["C:\\Users\\chris\\Documents\\"];
    const filename = "hej.txt";
    const key = "super secret key";
    const files = await miniBackup.findFiles(filename, roots);
    const filesInBase64 = await miniBackup.readFilesToBase64(files);
    const encrypted = await miniBackup.encryptBase64Files(filesInBase64, key);
    const writtenFiles = await miniBackup.writeEncryptedFiles(encrypted);

    setTimeout(async () => {
      const readFiles = await miniBackup.readEncryptedFiles(
        writtenFiles.map((file) => file.getPath()),
        key
      );
      const results = await miniBackup.writeRestoredFiles(readFiles);

      console.log("Results!", results);
    }, 2500);
  }
}

App.main();
