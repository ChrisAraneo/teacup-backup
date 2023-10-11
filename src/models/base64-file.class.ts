import { FileProcessor } from "../file-processor";
import { TextFile } from "./text-file.class";

export class Base64File extends TextFile {
  static async fromFile(path: string): Promise<Base64File> {
    const result = await FileProcessor.readFileToBase64(path);

    return new Base64File(result.path, result.content, result.modifiedDate);
  }

  async writeToFile(): Promise<void> {
    return FileProcessor.writeFileFromBase64(this);
  }
}
