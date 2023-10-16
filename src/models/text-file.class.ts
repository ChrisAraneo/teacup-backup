import { FileProcessor } from "../file-processor";
import { File } from "./file.class";

export class TextFile extends File<string> {
  async writeToFile(): Promise<void> {
    return FileProcessor.writeTextFile(this);
  }
}
