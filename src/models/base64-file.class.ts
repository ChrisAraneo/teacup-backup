import { FileProcessor } from "../file-processor";
import { File } from "./file.class";

export class Base64File extends File<string> {
  static async fromFile(path: string): Promise<Base64File> {
    const result = await FileProcessor.readFileToBase64(path);

    return new Base64File(result.path, result.content);
  }

  async writeToFile(): Promise<void> {
    return FileProcessor.writeFileFromBase64({
      path: this.path,
      content: this.content,
    });
  }
}
