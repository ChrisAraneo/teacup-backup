import { MiniBackup } from "./mini-backup";

class App {
  static main(): void {
    new MiniBackup()
      .findFiles("spiders-password-db.kdbx", ["D:\\", "E:\\"])
      .then((results) => {
        console.log("Results!", results);
      });
  }
}

App.main();
