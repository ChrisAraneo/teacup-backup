import { JsonFile } from "../models/json-file.class";
import { FileReader, ReadFileResult } from "./file-reader.class";

export class JsonFileReader extends FileReader<JsonFile> {
  async readFile(path: string): Promise<JsonFile> {
    return new Promise((resolve, reject) => {
      this._readFile(path, "utf8")
        .catch((error) => reject(error))
        .then((result: ReadFileResult) => {
          resolve(
            new JsonFile(
              result.path,
              JSON.parse(result.data),
              result.modifiedDate
            )
          );
        });
    });
  }
}
