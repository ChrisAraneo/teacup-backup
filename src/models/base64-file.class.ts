import { Base64FileReader } from '../file-system/base64-file-reader.class';
import { Base64FileWriter } from '../file-system/base64-file-writer.class';
import { TextFile } from './text-file.class';

export class Base64File extends TextFile {
  private static base64FileReader: Base64FileReader;

  static async fromFile(path: string): Promise<Base64File> {
    if (!this.base64FileReader) {
      this.base64FileReader = new Base64FileReader();
    }

    const result = await this.base64FileReader.readFile(path);

    return new Base64File(result.getPath(), result.getContent(), result.getModifiedDate());
  }

  async writeToFile(): Promise<void> {
    return new Base64FileWriter().writeFile(this); // TODO To property
  }
}
