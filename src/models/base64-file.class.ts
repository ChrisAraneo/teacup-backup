import { FileProcessor } from "../file-processor";
import { Base64FileReader } from "../file-system/base64-file-reader.class";
import { TextFile } from "./text-file.class";

export class Base64File extends TextFile {
  static async fromFile(path: string): Promise<Base64File> {
    const result = await Base64FileReader.readFile(path);

    return new Base64File(result.path, result.content, result.modifiedDate);
  }

  async writeToFile(): Promise<void> {
    return FileProcessor.writeFileFromBase64(this);
  }
}
