import Path from "path";
import { CurrentDirectoryProvider } from "./file-system/current-directory-provider";
import { JsonFileReader } from "./file-system/json-file-reader.class";
import { JsonFile } from "./models/json-file.class";

export class ConfigLoader {
  static async readConfigFile(): Promise<object> {
    const currentDirectory = CurrentDirectoryProvider.getCurrentDirectory();
    const path = Path.normalize(`${currentDirectory}/config.json`);
    let config: JsonFile | undefined;

    try {
      config = await new JsonFileReader().readFile(path);
    } catch (error: unknown) {
      throw Error(
        "File config.json not found. Create config.json file in the application directory."
      );
    }

    if (!config) {
      throw Error("File config.json is empty or incorrect.");
    }

    return (config as JsonFile)?.getContent();
  }
}
